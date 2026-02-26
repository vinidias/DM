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

        const targetEmail = "vinicius.oliveira@digitalmonk.com.br";
        const contactId = "7245140000000614005"; // Vinicius

        // 3. Get Configured From Addresses
        console.log("\nRetrieving configured from addresses...");
        const fromAddressesResponse = await client.callTool({
            name: "Bigin_getConfiguredFromAddresses",
            arguments: {}
        });

        let fromEmail = null;
        if (fromAddressesResponse.content && fromAddressesResponse.content[0].text) {
            const fromData = JSON.parse(fromAddressesResponse.content[0].text);
            if (fromData.from_address && fromData.from_address.length > 0) {
                fromEmail = fromData.from_address[0].email;
                console.log(`Using from address: ${fromEmail}`);
            } else {
                console.log("No configured from addresses found.");
                process.exit(1);
            }
        }

        // Test Scheduling for 1 hour from now
        console.log("\nTesting scheduling...");

        function getFutureTimeISOZ(hours) {
            const date = new Date();
            date.setHours(date.getHours() + hours);
            // Format strictly as ISO 8601 with Z (e.g. 2026-02-26T16:20:36Z)
            return date.toISOString();
        }

        const scheduledTimeStr = getFutureTimeISOZ(1);
        console.log(`Scheduling for: ${scheduledTimeStr}`);

        const sendEmailResponse = await client.callTool({
            name: "Bigin_sendEmails",
            arguments: {
                path_variables: {
                    module_api_name: "Contacts",
                    id: contactId
                },
                body: {
                    data: [
                        {
                            from: { email: fromEmail },
                            to: [{ email: targetEmail }],
                            subject: "Teste Agendamento Bigin",
                            content: "<p>Email de teste para valiar o agendamento no Bigin</p>",
                            mail_format: "html",
                            schedule_time: scheduledTimeStr
                        }
                    ]
                }
            }
        });

        console.log(`\nEmail send response:`);
        if (sendEmailResponse.content && sendEmailResponse.content[0].text) {
            const response = JSON.parse(sendEmailResponse.content[0].text);
            console.log(JSON.stringify(response, null, 2));
        } else {
            console.log(sendEmailResponse);
        }

    } catch (error) {
        console.error("An error occurred during execution:", error);
    } finally {
        process.exit(0);
    }
}

main().catch(console.error);
