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
            name: "email-client",
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

        const contactId = "7245140000000614005"; // Vinicius

        console.log(`\nRetrieving Emails for Contact ID: ${contactId}...`);
        const searchResponse = await client.callTool({
            name: "Bigin_getRelatedListRecords",
            arguments: {
                path_variables: {
                    module_api_name: "Contacts",
                    id: contactId,
                    related_list_api_name: "Emails"
                }
            }
        });

        if (searchResponse.content && searchResponse.content[0].text) {
            console.log("Raw Response:");
            console.log(searchResponse.content[0].text);
            try {
                const data = JSON.parse(searchResponse.content[0].text);
                console.log("Parsed JSON:", JSON.stringify(data, null, 2));
            } catch (e) {
                console.log("Could not parse as JSON.");
            }
        } else {
            console.log(searchResponse);
        }

    } catch (error) {
        console.error("An error occurred during execution:", error);
    } finally {
        process.exit(0);
    }
}

main().catch(console.error);
