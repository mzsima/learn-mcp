from starlette.applications import Starlette
from starlette.responses import JSONResponse, FileResponse
from starlette.routing import Route, Mount
from starlette.staticfiles import StaticFiles
import mcp.types as types
from mcp.server.lowlevel import Server
from mcp.server.sse import SseServerTransport
from enum import Enum
from typing import List, Dict, Union
import uvicorn
import signal
import sys

class Status(Enum):
    OPEN = "Open"
    DONE = "Done"
    PENDING = "Pending"

# Shared in-memory storage
todos: List[Dict[str, Union[int, str, Status]]] = []
todo_id_counter = 1

def main() -> int:
    # MCP Server setup
    mcp_app = Server("simple-todo")

    # Starlette routes
    async def index(request):
        return FileResponse('static/index.html')

    async def get_todos_api(request):
        return JSONResponse([
            {
                "id": todo["id"],
                "body": todo["body"],
                "status": todo["status"].value
            } for todo in todos
        ])

    async def add_todo_api(request):
        global todo_id_counter
        data = await request.json()
        if not data or 'body' not in data:
            return JSONResponse({'error': 'Body is required'}, status_code=400)
        todo = {
            'id': todo_id_counter,
            'body': data['body'],
            'status': Status.OPEN
        }
        todos.append(todo)
        todo_id_counter += 1
        return JSONResponse({
            "id": todo["id"],
            "body": todo["body"],
            "status": todo["status"].value
        }, status_code=201)

    async def delete_todo_api(request):
        global todos
        todo_id = int(request.path_params['todo_id'])
        todos = [todo for todo in todos if todo['id'] != todo_id]
        return JSONResponse(None, status_code=204)

    async def update_todo_api(request):
        todo_id = int(request.path_params['todo_id'])
        data = await request.json()
        if not data or 'status' not in data:
            return JSONResponse({'error': 'Status is required'}, status_code=400)
        if data['status'] not in [status.value for status in Status]:
            return JSONResponse({'error': 'Invalid status value'}, status_code=400)

        for todo in todos:
            if todo['id'] == todo_id:
                todo['status'] = Status(data['status'])
                return JSONResponse({
                    "id": todo["id"],
                    "body": todo["body"],
                    "status": todo["status"].value
                })

        return JSONResponse({'error': 'Todo not found'}, status_code=404)

    # MCP Tools
    @mcp_app.call_tool()
    async def handle_tool(name: str, arguments: dict) -> List[types.TextContent]:
        if name == "get_todos":
            return [
                types.TextContent(
                    type="text",
                    text=JSONResponse([
                        {
                            "id": todo["id"],
                            "body": todo["body"],
                            "status": todo["status"].value,
                        } for todo in todos
                    ]).body.decode(),
                )
            ]
        elif name == "add_todo":
            if not arguments or "body" not in arguments:
                raise ValueError("Body is required")

            global todo_id_counter
            todo = {
                "id": todo_id_counter,
                "body": arguments["body"],
                "status": Status.OPEN,
            }
            todos.append(todo)
            todo_id_counter += 1

            return [
                types.TextContent(
                    type="text",
                    text=JSONResponse({
                        "id": todo["id"],
                        "body": todo["body"],
                        "status": todo["status"].value,
                    }).body.decode(),
                )
            ]
        elif name == "update_todo":
            if not arguments or "id" not in arguments or "status" not in arguments:
                raise ValueError("ID and status are required")
            if arguments["status"] not in [status.value for status in Status]:
                raise ValueError("Invalid status value")

            for todo in todos:
                if todo["id"] == arguments["id"]:
                    todo["status"] = Status(arguments["status"])
                    return [
                        types.TextContent(
                            type="text",
                            text=JSONResponse({
                                "id": todo["id"],
                                "body": todo["body"],
                                "status": todo["status"].value,
                            }).body.decode(),
                        )
                    ]

            raise ValueError("Todo not found")
        else:
            raise ValueError(f"Unknown tool name: {name}")

    @mcp_app.list_tools()
    async def list_tools() -> List[types.Tool]:
        return [
            types.Tool(
                name="get_todos",
                description="Get all todo items",
                inputSchema={"type": "object"}
            ),
            types.Tool(
                name="add_todo",
                description="Add a new todo item",
                inputSchema={
                    "type": "object",
                    "required": ["body"],
                    "properties": {
                        "body": {"type": "string"}
                    }
                }
            ),
            types.Tool(
                name="update_todo",
                description="Update todo status",
                inputSchema={
                    "type": "object",
                    "required": ["id", "status"],
                    "properties": {
                        "id": {"type": "integer"},
                        "status": {"type": "string", "enum": ["Open", "Done", "Pending"]}
                    }
                }
            )
        ]

    # SSE setup
    sse = SseServerTransport("/messages/")

    async def handle_sse(request):
        async with sse.connect_sse(request.scope, request.receive, request._send) as streams:
            await mcp_app.run(streams[0], streams[1], mcp_app.create_initialization_options())

    # Combined application setup
    routes = [
        Route('/', index),
        Route('/todos', get_todos_api, methods=['GET']),
        Route('/todos', add_todo_api, methods=['POST']),
        Route('/todos/{todo_id:int}', delete_todo_api, methods=['DELETE']),
        Route('/todos/{todo_id:int}', update_todo_api, methods=['PUT']),
        Route('/sse', handle_sse),
        Mount('/messages/', app=sse.handle_post_message),
        Mount('/static', StaticFiles(directory='static'), name='static')
    ]

    app = Starlette(debug=True, routes=routes)

    uvicorn.run(app, host="0.0.0.0", port=8000)

    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())
