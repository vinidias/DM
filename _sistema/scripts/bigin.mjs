/**
 * bigin.mjs — Módulo de conexão com o Bigin CRM via MCP HTTP
 *
 * Conecta diretamente ao endpoint HTTP do Zoho MCP.
 * O usuário só precisa configurar BIGIN_MCP_URL no .env.
 *
 * Formato da URL (obtida no painel do Bigin > Integrações > MCP):
 *   https://digital-test-XXXXXXXXX.zohomcp.com/mcp/message?key=SUA_CHAVE
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import dotenv from 'dotenv';
import path from 'path';

// Carrega o .env da raiz do projeto
dotenv.config({ path: path.resolve(import.meta.dirname, '../../.env') });

/**
 * Cria e conecta um cliente MCP ao Bigin via HTTP direto.
 * @returns {Promise<Client>} Cliente MCP conectado
 */
export async function conectarBigin() {
    const url = process.env.BIGIN_MCP_URL;

    if (!url) {
        console.error("\n❌ BIGIN_MCP_URL não encontrada no .env");
        console.error("   Cole a URL gerada no painel Bigin > Integrações > MCP\n");
        process.exit(1);
    }

    const transport = new StreamableHTTPClientTransport(new URL(url));
    const client = new Client(
        { name: "dm-marketing-hub", version: "1.0.0" },
        { capabilities: {} }
    );

    await client.connect(transport);
    return client;
}

/**
 * Busca o endereço de email remetente configurado no Bigin.
 * @param {Client} client
 * @returns {Promise<string>} Email do remetente
 */
export async function buscarRemetente(client) {
    const res = await client.callTool({ name: "Bigin_getConfiguredFromAddresses", arguments: {} });
    const data = JSON.parse(res.content[0].text);
    if (!data.from_address || data.from_address.length === 0) {
        throw new Error("Nenhum endereço de email remetente configurado no Bigin.");
    }
    return data.from_address[0].email;
}

/**
 * Busca um contato no Bigin pelo email.
 * @param {Client} client
 * @param {string} email
 * @returns {Promise<string|null>} ID do contato ou null se não encontrado
 */
export async function buscarContato(client, email) {
    const res = await client.callTool({
        name: "Bigin_searchRecords",
        arguments: {
            path_variables: { module_api_name: "Contacts" },
            query_params: { criteria: `(Email:equals:${email})` }
        }
    });
    const data = JSON.parse(res.content[0].text);
    return data.data && data.data.length > 0 ? data.data[0].id : null;
}

/**
 * Lista contatos do Bigin por tag de setor.
 * @param {Client} client
 * @param {string} tag - Ex: "telecom", "financeiro"
 * @returns {Promise<Array>} Lista de contatos
 */
export async function listarContatosPorSetor(client, tag) {
    const res = await client.callTool({
        name: "Bigin_getRecords",
        arguments: {
            path_variables: { module_api_name: "Contacts" },
            query_params: { criteria: `(Tag:contains:${tag})`, per_page: 200 }
        }
    });
    const data = JSON.parse(res.content[0].text);
    return data.data || [];
}

/**
 * Envia um email via Bigin.
 * @param {Client} client
 * @param {string} fromEmail
 * @param {string} contactId
 * @param {string} toEmail
 * @param {string} subject
 * @param {string} htmlContent
 * @param {string|null} scheduleTime - ISO 8601 (opcional)
 */
export async function enviarEmail(client, fromEmail, contactId, toEmail, subject, htmlContent, scheduleTime = null) {
    const emailData = {
        from: { email: fromEmail },
        to: [{ email: toEmail }],
        subject,
        content: htmlContent,
        mail_format: "html"
    };

    if (scheduleTime) {
        emailData.schedule_time = scheduleTime;
    }

    await client.callTool({
        name: "Bigin_sendEmails",
        arguments: {
            path_variables: { module_api_name: "Contacts", id: contactId },
            body: { data: [emailData] }
        }
    });
}

/**
 * Registra uma nota num contato do Bigin.
 * @param {Client} client
 * @param {string} contactId
 * @param {string} titulo
 * @param {string} conteudo
 */
export async function registrarNota(client, contactId, titulo, conteudo) {
    await client.callTool({
        name: "Bigin_addNotesToSpecificRecord",
        arguments: {
            path_variables: { module_api_name: "Contacts", id: contactId },
            body: { data: [{ Note_Title: titulo, Note_Content: conteudo }] }
        }
    });
}
