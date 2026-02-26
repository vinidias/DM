import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function main() {
    const url = new URL("https://digital-test-915932048.zohomcp.com/mcp/message?key=8ffbd9b014373681a2af4a52b0614b66");
    const transport = new SSEClientTransport(url);

    const client = new Client(
        {
            name: "test-client-sse",
            version: "1.0.0",
        },
        {
            capabilities: {},
        }
    );

    console.log("Connecting to the MCP server via SSE...");
    try {
        await client.connect(transport);
        console.log("Connected successfully!");

        const toolsResponse = await client.listTools();
        console.log(`Found ${toolsResponse.tools.length} tools. First 5:`, toolsResponse.tools.map(t => t.name).slice(0, 5));

        console.log("Calling Bigin_getModules...");
        const modulesResponse = await client.callTool({
            name: "Bigin_getModules",
            arguments: {}
        });
        console.log("Modules response:", JSON.stringify(modulesResponse, null, 2));

    } catch (error) {
        console.error("Failed:", error);
    } finally {
        process.exit(0);
    }
}

main().catch(console.error);
