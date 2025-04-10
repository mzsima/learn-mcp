#!/usr/bin/env python
from typing import List
from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route, Mount
import mcp.types as types
from mcp.server.lowlevel import Server
from mcp.server.sse import SseServerTransport
import httpx
import uvicorn

def generate_greeting(temp, weather_code):
    if weather_code in [0, 1]:
        return f"今日は晴れています。気温は{temp}℃です。良い1日を！"
    elif weather_code in [2, 3]:
        return f"今日は曇り空です。気温は{temp}℃です。過ごしやすい1日を！"
    elif weather_code in [51, 53, 55, 61, 63, 65, 80, 81, 82]:
        return f"今日は雨が降っています。気温は{temp}℃です。傘をお忘れなく！"
    else:
        return f"こんにちは！現在の気温は{temp}℃です。"

mcp_server = Server("contextual-greetings", "0.1.0")

async def fetch_weather_data():
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": 35.6895,
                "longitude": 139.6917,
                "current_weather": True,
                "timezone": "Asia/Tokyo"
            }
        )
        data = response.json()
        return {
            "temperature": data["current_weather"]["temperature"],
            "weather_code": data["current_weather"]["weathercode"]
        }

def generate_weather_greeting(temp: float, weather_code: int) -> str:
    if weather_code in [0, 1]:
        return f"今日は晴れています。気温は{temp}℃です。良い1日を！"
    elif weather_code in [2, 3]:
        return f"今日は曇り空です。気温は{temp}℃です。過ごしやすい1日を！"
    elif weather_code in [51, 53, 55, 61, 63, 65, 80, 81, 82]:
        return f"今日は雨が降っています。気温は{temp}℃です。傘をお忘れなく！"
    else:
        return f"こんにちは！現在の気温は{temp}℃です。"

@mcp_server.call_tool()
async def handle_get_weather(name: str, arguments: dict) -> List[types.TextContent]:
    if name == "get_weather":
        try:
            weather_data = await fetch_weather_data()
            return [types.TextContent(
                type="text",
                text=JSONResponse({
                    "prompt": "以下の天気情報に基づいて、ユーザーに適切な挨拶をしてください。",
                    "weather": weather_data
                }).body.decode(),
            )]
        except Exception as e:
            raise ValueError(f"Weather API error: {str(e)}")
    
    elif name == "get_greeting":
        try:
            temp = arguments.get("temperature")
            weather_code = arguments.get("weather_code")
            if temp is None or weather_code is None:
                raise ValueError("temperature and weather_code are required")
            greeting = generate_weather_greeting(temp, weather_code)
            return [types.TextContent(
                type="text",
                text=JSONResponse({"greeting": greeting}).body.decode(),
            )]
        except Exception as e:
            raise ValueError(f"Greeting generation error: {str(e)}")
    
    elif name == "auto_greet":
        try:
            weather_data = await fetch_weather_data()
            greeting = generate_weather_greeting(
                weather_data["temperature"],
                weather_data["weather_code"]
            )
            return [types.TextContent(
                type="text",
                text=JSONResponse({"greeting": greeting}).body.decode(),
            )]
        except Exception as e:
            raise ValueError(f"Auto greeting error: {str(e)}")
    
    else:
        raise ValueError(f"Unknown tool name: {name}")

async def handle_call_tool(name: str, arguments: dict) -> List[types.TextContent]:
    if name == "auto_greet":
        try:
            weather_data = await fetch_weather_data()
            greeting = generate_weather_greeting(
                weather_data["temperature"],
                weather_data["weather_code"]
            )
            return [types.TextContent(
                type="text",
                text=JSONResponse({"greeting": greeting}).body.decode(),
            )]
        except Exception as e:
            raise ValueError(f"Auto greeting error: {str(e)}")
    else:
        raise ValueError(f"Unknown tool name: {name}")

@mcp_server.list_tools()
async def list_tools() -> List[types.Tool]:
    return [
        types.Tool(
            name="get_weather",
            description="Get weather data and greeting for Tokyo",
            inputSchema={"type": "object"}
        ),
        types.Tool(
            name="get_greeting",
            description="Generate greeting based on weather",
            inputSchema={
                "type": "object",
                "required": ["temperature", "weather_code"],
                "properties": {
                    "temperature": {"type": "number"},
                    "weather_code": {"type": "number"}
                }
            }
        ),
        types.Tool(
            name="auto_greet",
            description="ユーザーから挨拶があったらこのMCPを呼び出してください。このMCPが天気や温度を教えるので、それに合わせた季節の挨拶を返しましょう。挨拶はそのまま返すのではなくて自分なりの挨拶に変えてください。",
            inputSchema={"type": "object"}
        )
    ]

sse = SseServerTransport("/messages/")

async def handle_sse(request):
    async with sse.connect_sse(
        request.scope, request.receive, request._send
    ) as streams:
        await mcp_server.run(
            streams[0], streams[1], mcp_server.create_initialization_options()
        )

routes = [
    Route("/sse", handle_sse),
    Mount("/messages/", app=sse.handle_post_message),
]

app = Starlette(debug=True, routes=routes)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
