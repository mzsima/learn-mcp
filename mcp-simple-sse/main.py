import click
import httpx
import mcp.types as types
from mcp.server.lowlevel import Server

from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.routing import Mount, Route
from bs4 import BeautifulSoup

async def fetch_website(
    url: str,
) -> list[types.TextContent | types.ImageContent | types.EmbeddedResource]:
    headers = {
        "User-Agent": "MCP Test Server (github.com/modelcontextprotocol/python-sdk)"
    }
    async with httpx.AsyncClient(follow_redirects=True, headers=headers) as client:
        response = await client.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        text = soup.get_text()
        # filter empty line
        text = "\n".join(line for line in text.splitlines() if line.strip())
        return [types.TextContent(type="text", text=text)]


@click.command()
@click.option("--port", default=8000, help="Port to listen on for SSE")
def main(port: int) -> int:
    app = Server("mcp-website-fetcher")

    @app.call_tool()
    async def fetch_tool(
        name: str, arguments: dict
    ) -> list[types.TextContent | types.ImageContent | types.EmbeddedResource]:
        if name != "fetch":
            raise ValueError(f"Unknown tool name: {name}")
        if "url" not in arguments:
            raise ValueError("Missing required argument: url")
        return await fetch_website(arguments["url"])
    
    @app.list_tools()
    async def list_tools() -> list[types.Tool]:
        return [
            types.Tool(
                name="fetch",
                description="Fetch a website and return its content",
                inputSchema={
                    "type": "object",
                    "required": ["url"],
                    "properties": {
                        "url": {
                            "type": "string",
                            "description": "The URL of the website to fetch",
                        },
                    },
                }
            ),
        ]
    
    sse = SseServerTransport("/messages/")

    async def handle_sse(request):
        async with sse.connect_sse(
            request.scope, request.receive, request._send
        ) as streams:
            await app.run(
                streams[0], streams[1], app.create_initialization_options()
            )

    starlette_app = Starlette(
        debug=True,
        routes=[
            Route("/sse", endpoint=handle_sse),
            Mount("/messages/", app=sse.handle_post_message),
        ],
    )

    import uvicorn
    import signal
    import sys

    def shutdown_server(signal, frame):
        print("Shutting down server...")
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown_server)  # Ctrl+C をキャッチ
    uvicorn.run(starlette_app, host="0.0.0.0", port=port)

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
