from flet import app, Page, WebView
import threading
from mcp.server.fastmcp import FastMCP

# Create an MCP server
mcp = FastMCP("Mini Browser MCP Server")

# Add a tool to update the WebView URL
@mcp.tool()
def update_url(url: str) -> str:
    """Update the WebView to display the given URL."""
    if webview:
        webview.url = url
        webview.update()
    return f"WebView updated to: {url}"

# Initialize Flet UI
webview = None

def run_flet_app(page: Page):
    global webview
    webview = WebView(
        url="https://www.google.com",
        on_page_started=lambda _: print("Page started"),
        on_page_ended=lambda _: print("Page ended"),
        on_web_resource_error=lambda e: print("Page error:", e.data),
        expand=True,
    )
    page.add(webview)



if __name__ == "__main__":
    # Run the Flet app and MCP server
    threading.Thread(target=mcp.run, daemon=False).start()
    app(target=run_flet_app)
