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
        let contactId = null;

        // 1. Search for contact
        console.log(`\nSearching for Contact with email: ${targetEmail}...`);
        const searchResponse = await client.callTool({
            name: "Bigin_searchRecords",
            arguments: {
                path_variables: {
                    module_api_name: "Contacts"
                },
                query_params: {
                    email: targetEmail
                }
            }
        });

        if (searchResponse.content && searchResponse.content[0].text) {
            const data = JSON.parse(searchResponse.content[0].text);
            if (data.data && data.data.length > 0) {
                contactId = data.data[0].id;
                console.log(`Contact found with ID: ${contactId}`);
            }
        }

        // 2. Create contact if not found
        if (!contactId) {
            console.log("Contact not found. Creating a new one...");
            const createResponse = await client.callTool({
                name: "Bigin_addRecords",
                arguments: {
                    path_variables: {
                        module_api_name: "Contacts"
                    },
                    body: {
                        data: [
                            {
                                Last_Name: "Oliveira",
                                First_Name: "Vinicius",
                                Email: targetEmail
                            }
                        ]
                    }
                }
            });

            if (createResponse.content && createResponse.content[0].text) {
                const createData = JSON.parse(createResponse.content[0].text);
                if (createData.data && createData.data[0].details && createData.data[0].details.id) {
                    contactId = createData.data[0].details.id;
                    console.log(`Contact created successfully with ID: ${contactId}`);
                } else {
                    console.log(`Failed to extract ID after creation: ${JSON.stringify(createData)}`);
                    process.exit(1);
                }
            }
        }

        // 3. Get Configured From Addresses
        console.log("\nRetrieving configured from addresses...");
        const fromAddressesResponse = await client.callTool({
            name: "Bigin_getConfiguredFromAddresses",
            arguments: {}
        });

        let fromEmail = null;
        if (fromAddressesResponse.content && fromAddressesResponse.content[0].text) {
            const fromData = JSON.parse(fromAddressesResponse.content[0].text);
            console.log("From Addresses Response Data:", JSON.stringify(fromData, null, 2));
            if (fromData.from_address && fromData.from_address.length > 0) {
                fromEmail = fromData.from_address[0].email;
                console.log(`Using from address: ${fromEmail}`);
            } else {
                console.log("No configured from addresses found.");
                process.exit(1);
            }
        }

        // 4. Send/Schedule Emails
        console.log("\nScheduling emails...");

        function getFutureISODate(days) {
            const date = new Date();
            date.setDate(date.getDate() + days);
            // Ensure time is in the future for scheduling. Let's schedule for 10:00 AM local time.
            date.setHours(10, 0, 0, 0);
            // Bigin requires ISO 8601 format: YYYY-MM-DDThh:mm:ss+TZD
            return date.toISOString();
        }

        const email2Body = `
        <p>Oi, Vinicius, tudo bem?</p>
        <p>Voltando ao meu email anterior, uma das maiores vitórias rápidas para nossos clientes é acabar com a dependência da equipe de TI.</p>
        <p>Como a Glassbox grava tudo de forma <strong>Tagless</strong> e retroativa, seu time tem autonomia total para investigar novos comportamentos sem esperar novas tags de analytics. Além disso, nosso sistema <strong>Voice of the Silent (VoS)</strong> usa IA para cruzar tickets e feedbacks negativos com a base de dados, encontrando e quantificando o impacto nos 95% de usuários "silenciosos" que sofreram o mesmo problema mas não reclamaram.</p>
        <p>Posso te mandar um vídeo de 2 minutos mostrando como o Voice of the Silent e nossas Análises de Fricção quantificam erros do site em reais? Ou prefere que eu te mostre numa chamada rápida na terça-feira?</p>
        <p>Abraço,</p>
        <p>Gabriel</p>`;

        const email3Body = `
        <p>Olá, Vinicius,</p>
        <p>Sei que sua agenda deve estar lotada, então serei rápido.</p>
        <p>Se otimizar jornadas e dar autonomia analítica para o time não for prioridade agora, sem problemas. Mas pensei que você poderia achar este material útil sobre as tendências de 2026: <strong>[Link para Relatório: Como a IA Transformou o Digital Experience Intelligence]</strong>.</p>
        <p>Ele fala bastante sobre como empresas pararam de adivinhar o que os clientes querem e começaram a usar <em>Agentic AI</em> para diagnosticar quedas de conversão (incluindo falhas de API invisíveis no checkout).</p>
        <p>Fique à vontade para me acionar se o tema entrar no radar da Digital Monk.</p>
        <p>Abraço,</p>
        <p>Gabriel</p>`;

        const email4Body = `
        <p>Oi, Vinicius,</p>
        <p>Geralmente, quando não tenho retorno até agora, as prioridades da Digital Monk estão focadas em outras frentes (e entendo perfeitamente, os desafios de DXI exigem foco).</p>
        <p>Estou encerrando minhas tentativas por aqui para não lotar sua caixa de entrada!</p>
        <p>Caso no futuro a eliminação do tagueamento manual, redução do Cost of Delay e o entendimento real do atrito da jornada voltem a ser foco, sinta-se à vontade para me chamar.</p>
        <p>Desejo muito sucesso para você e seu time nesse semestre!</p>
        <p>Abraço,</p>
        <p>Gabriel</p>`;

        // Email 2: Send 3 days later
        const scheduleTime2 = getFutureISODate(3);
        // Email 3: Send 5 days later
        const scheduleTime3 = getFutureISODate(5);
        // Email 4: Send 7 days later
        const scheduleTime4 = getFutureISODate(7);

        const emailSequence = [
            {
                subject: "Autonomia para o seu time de Produto na Glassbox",
                content: email2Body,
                scheduleTime: scheduleTime2,
                label: "Email 2 (Follow-up 1)"
            },
            {
                subject: "[Nome], material sobre CX orientado por IA",
                content: email3Body,
                scheduleTime: scheduleTime3,
                label: "Email 3 (Follow-up 2)"
            },
            {
                subject: "Encerrando os contatos (por enquanto)",
                content: email4Body,
                scheduleTime: scheduleTime4,
                label: "Email 4 (Break-up)"
            }
        ];

        for (const emailData of emailSequence) {
            console.log(`\nScheduling ${emailData.label} for ${emailData.scheduleTime}...`);
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
                                subject: emailData.subject,
                                content: emailData.content,
                                mail_format: "html",
                                schedule_time: emailData.scheduleTime
                            }
                        ]
                    }
                }
            });

            if (sendEmailResponse.content && sendEmailResponse.content[0].text) {
                const response = JSON.parse(sendEmailResponse.content[0].text);
                console.log(`Status: ${response.data[0].status} - ${response.data[0].message}`);
            } else {
                console.log(sendEmailResponse);
            }
        }

    } catch (error) {
        console.error("An error occurred during execution:", error);
    } finally {
        process.exit(0);
    }
}

main().catch(console.error);
