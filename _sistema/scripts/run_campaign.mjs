/**
 * run_campaign.mjs — Motor de execução de campanhas de marketing.
 * Uso: npm run start-campaign
 *
 * Fluxo:
 *   1. Lê contatos de _sistema/contatos/curado.csv (extraídos do Bigin)
 *   2. Carrega template HTML da pasta Campanhas/_Modelos/Emails/
 *   3. Conecta ao Bigin via HTTP e envia os emails
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { conectarBigin, buscarRemetente, buscarContato, enviarEmail, registrarNota } from './bigin.mjs';

const ROOT = path.resolve(import.meta.dirname, '../..');
const CONTATOS_PATH = path.join(ROOT, '_sistema/contatos/curado.csv');
const TEMPLATE_PATH = path.join(ROOT, 'Campanhas/_Modelos/Emails/Email_1_Descoberta.html');

// ─── Leitura de Contatos ──────────────────────────────────────────────────────

function carregarContatos() {
    if (!fs.existsSync(CONTATOS_PATH)) {
        console.error(`\n❌ Arquivo de contatos não encontrado: ${CONTATOS_PATH}`);
        console.error(`   Extraia contatos do Bigin primeiro e salve em _sistema/contatos/curado.csv\n`);
        process.exit(1);
    }
    const csv = fs.readFileSync(CONTATOS_PATH, 'utf-8');
    const contatos = parse(csv, { columns: true, skip_empty_lines: true });
    console.log(`\n📋 ${contatos.length} contato(s) carregado(s) para processamento.`);
    return contatos;
}

// ─── Geração de Conteúdo ──────────────────────────────────────────────────────

function montarEmail(contato) {
    // Carrega o template HTML e substitui as variáveis
    let html = fs.existsSync(TEMPLATE_PATH)
        ? fs.readFileSync(TEMPLATE_PATH, 'utf8')
        : "<p>Olá {{NOME}},</p><p>{{AI_CONTENT}}</p>";

    // Conteúdo personalizado (aqui entraria a chamada ao NotebookLM via Antigravity)
    const icebreaker = `Acompanhei o trabalho da ${contato.Empresa} e queria compartilhar um dado que pode ser relevante para o digital de vocês em 2026.`;

    html = html
        .replace(/\{\{NOME\}\}/g, contato.Nome)
        .replace(/\{\{EMPRESA\}\}/g, contato.Empresa)
        .replace(/\{\{SETOR\}\}/g, contato.Setor || 'seu setor')
        .replace(/\{\{AI_CONTENT\}\}/g, icebreaker)
        .replace(/\{\{INSIGHT_SETOR\}\}/g, `Empresas do setor ${contato.Setor || 'digital'} frequentemente enfrentam perdas invisíveis de receita por falhas técnicas não detectadas.`);

    const assunto = `Onde a ${contato.Empresa} está perdendo receita digital em 2026?`;
    return { assunto, html };
}

// ─── Execução Principal ───────────────────────────────────────────────────────

async function main() {
    console.log("\n🚀 Digital Monk — Iniciando Campanha\n");

    const contatos = carregarContatos();

    console.log("\n🔌 Conectando ao Bigin...");
    const client = await conectarBigin();
    const fromEmail = await buscarRemetente(client);
    console.log(`   Remetente: ${fromEmail}\n`);

    for (const contato of contatos) {
        console.log(`\n📨 Processando: ${contato.Nome} <${contato.Email}>`);

        const contactId = await buscarContato(client, contato.Email);
        if (!contactId) {
            console.log(`   ⚠️  Contato não encontrado no Bigin. Pulando.`);
            continue;
        }

        const { assunto, html } = montarEmail(contato);

        await enviarEmail(client, fromEmail, contactId, contato.Email, assunto, html);
        await registrarNota(client, contactId, "Campanha Iniciada",
            `Email 1 enviado em ${new Date().toLocaleDateString('pt-BR')} via dm-marketing-hub.`);

        console.log(`   ✅ Email enviado e registrado no CRM.`);
    }

    console.log("\n🎉 Campanha finalizada.\n");
    process.exit(0);
}

main().catch(err => {
    console.error("\n❌ Erro:", err.message);
    process.exit(1);
});
