import asyncio
import mysql.connector
from mcp.server.models import InitializationOptions
from mcp.server import Notification, Server
from mcp.server.stdio import stdio_server
import mcp.types as types

# Database Configuration
db_config = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "",
    "database": "room_booking"
}

server = Server("mysql-room-booking")

@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="query_db",
            description="Execute a SELECT query on the room_booking database",
            inputSchema={
                "type": "object",
                "properties": {
                    "sql": {"type": "string", "description": "The SQL query to execute"},
                },
                "required": ["sql"],
            },
        ),
        types.Tool(
            name="describe_table",
            description="Get the schema of a specific table",
            inputSchema={
                "type": "object",
                "properties": {
                    "table_name": {"type": "string", "description": "The name of the table"},
                },
                "required": ["table_name"],
            },
        )
    ]

@server.call_tool()
async def handle_call_tool(name: str, arguments: dict | None) -> list[types.TextContent]:
    if not arguments:
        return [types.TextContent(type="text", text="Missing arguments")]

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        if name == "query_db":
            cursor.execute(arguments["sql"])
            results = cursor.fetchall()
            return [types.TextContent(type="text", text=str(results))]

        elif name == "describe_table":
            cursor.execute(f"DESCRIBE {arguments['table_name']}")
            results = cursor.fetchAll()
            return [types.TextContent(type="text", text=str(results))]

        cursor.close()
        conn.close()
    except Exception as e:
        return [types.TextContent(type="text", text=f"Error: {str(e)}")]

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="mysql-room-booking",
                server_version="0.1.0",
                capabilities=server.get_capabilities(
                    notification_options=Notification(),
                    experimental_capabilities={},
                ),
            ),
        )

if __name__ == "__main__":
    asyncio.run(main())
