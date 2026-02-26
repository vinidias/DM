import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
    const transport = new StdioClientTransport({
        command: "npx",
        args: [
            "-y",
            "mcp-remote",
            "https://digital-test-915932048.zohomcp.com/mcp/message?key=2090cbeecb3ad403f30ef593ec07d96a",
            "--transport",
            "http-only"
        ],
    });

    const client = new Client(
        {
            name: "test-client",
            version: "1.0.0",
        },
        {
            capabilities: {},
        }
    );

    console.log("Connecting to the MCP server...");
    try {
        await client.connect(transport);
        console.log("Connected successfully!");

        const toolsResponse = await client.listTools();
        console.log("Available tools:");
        for (const tool of toolsResponse.tools) {
            console.log(`- ${tool.name}: ${tool.description}`);
            console.log(JSON.stringify(tool.inputSchema, null, 2));
        }

    } catch (error) {
        console.error("Failed to connect or list:", error);
    } finally {
        process.exit(0);
    }
}

main().catch(console.error);
