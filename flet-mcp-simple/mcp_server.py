from flet import app, Page, Column, Text
import threading
from mcp.server.fastmcp import FastMCP

# Create an MCP server
mcp = FastMCP("Flet MCP Server")

# Add a tool to display messages
@mcp.tool()
def display_message(message: str) -> str:
    """Display a message on the Flet chat window."""
    if chat_display:
        chat_display.controls.append(Text(message))
        chat_display.update()
    return "Message displayed successfully."

# Initialize Flet UI
chat_display = None

def run_flet_app(page: Page):
    global chat_display
    page.title = "Chat Response Viewer"
    chat_display = Column()
    page.add(chat_display)

if __name__ == "__main__":
    # Run the Flet app and MCP server
    threading.Thread(target=mcp.run, daemon=True).start()
    app(target=run_flet_app)
