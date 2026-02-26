#!/usr/bin/env node
/**
 * setup.mjs — Roda automaticamente após `npm install`
 *
 * 1. Verifica se o .env já existe com BIGIN_MCP_URL configurada.
 * 2. Se não existir, guia o usuário para gerar a URL no painel Bigin
 *    e salva a resposta no .env.
 * 3. Testa a conexão com o Bigin MCP para confirmar que funciona.
 * 4. Gera o AGENT.md com as instruções completas do agente.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const envPath = path.join(root, '.env');
const envExamplePath = path.join(root, '.env.example');
const agentMdPath = path.join(root, 'AGENT.md');

// ─────────────────────────────────────────────────────────────
// Utilitário: lê o .env atual e retorna chave→valor
// ─────────────────────────────────────────────────────────────
function lerEnv() {
    if (!fs.existsSync(envPath)) return {};
    const linhas = fs.readFileSync(envPath, 'utf-8').split('\n');
    return Object.fromEntries(
        linhas
            .filter(l => l.includes('=') && !l.startsWith('#'))
            .map(l => l.split('=').map(s => s.trim()))
    );
}

// ─────────────────────────────────────────────────────────────
// Utilitário: escreve/atualiza uma chave no .env
// ─────────────────────────────────────────────────────────────
function escreverEnv(chave, valor) {
    let conteudo = '';

    // Copia o .env.example como base se o .env não existir
    if (!fs.existsSync(envPath)) {
        conteudo = fs.existsSync(envExamplePath)
            ? fs.readFileSync(envExamplePath, 'utf-8')
            : '';
    } else {
        conteudo = fs.readFileSync(envPath, 'utf-8');
    }

    const regex = new RegExp(`^${chave}=.*`, 'm');
    if (regex.test(conteudo)) {
        conteudo = conteudo.replace(regex, `${chave}=${valor}`);
    } else {
        conteudo += `\n${chave}=${valor}\n`;
    }

    fs.writeFileSync(envPath, conteudo, 'utf-8');
}

// ─────────────────────────────────────────────────────────────
// Utilitário: pergunta no terminal e retorna a resposta
// ─────────────────────────────────────────────────────────────
function perguntar(rl, msg) {
    return new Promise(resolve => rl.question(msg, resolve));
}

// ─────────────────────────────────────────────────────────────
// Teste rápido da conexão Bigin
// ─────────────────────────────────────────────────────────────
async function testarConexao(url) {
    const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
    const { StreamableHTTPClientTransport } = await import('@modelcontextprotocol/sdk/client/streamableHttp.js');

    const transport = new StreamableHTTPClientTransport(new URL(url));
    const client = new Client(
        { name: 'dm-setup-check', version: '1.0.0' },
        { capabilities: {} }
    );

    await client.connect(transport);
    const list = await client.listTools();
    await client.close();
    return list.tools.length;
}

// ─────────────────────────────────────────────────────────────
// Conteúdo do AGENT.md
// ─────────────────────────────────────────────────────────────
function agentMdConteudo() {
    return `# Digital Monk Marketing Hub — Instruções do Agente

## Persona do Agente
Você é um **Estrategista Sênior de Marketing B2B** com 15+ anos de experiência em Growth, Inbound e Account-Based Marketing (ABM). Você sabe que vendas B2B modernas são construídas sobre **conexões humanas genuínas** antes de qualquer pitch comercial. Você NÃO é um vendedor agressivo. Você **educa, informa e cria valor primeiro**.

Seu objetivo principal é ajudar a Digital Monk a **construir relações de longo prazo** com lideranças de CX, Digital e Produto nos setores-alvo (Telecom, Financeiro, Varejo, Seguros), usando o Glassbox como veículo de inteligência — não como produto para empurrar.

## Princípios de Comunicação
1. **Insights first, produto depois.** Jamais abra um contato com pitch. Abra com dado relevante, dor de setor, ou benchmark que genuinamente ajude o prospect.
2. **Tom humano e coloquial.** Escreva como uma pessoa real, não como material de marketing corporativo.
3. **Personalização com contexto.** Use sempre o nome, empresa, setor e contexto específico do contato. Genérico = spam.
4. **Construção progressiva.** A cadência deve ir do educacional (Email 1-2) > problema específico (Email 3) > convite para conversa (Email 4).

---

## Fonte de Contatos — Bigin CRM (Zoho MCP)

> IMPORTANTE: Os contatos NÃO ficam somente em arquivos CSV locais.
> O Bigin CRM via MCP é a fonte de verdade dos contatos.
> O fluxo correto é: extrair do Bigin > trabalhar/curar localmente > executar campanha de volta pelo Bigin.

### Fluxo de Extração de Contatos (Antes de Qualquer Campanha)
1. Listar contatos por setor/tag: \`Bigin_getRecords\` filtrando pela tag do setor (ex: telecom, financeiro).
2. Verificar histórico de interação: \`Bigin_getRelatedListRecords\` com "Emails".
3. Salvar localmente para curadoria em \`files/contatos/<setor>_extraido.csv\`.
4. Retornar ao Bigin enriquecido via \`Bigin_updateSpecificRecord\` e \`Bigin_addTagsToSpecificRecord\`.

---

## Capacidades do MCP — Bigin CRM

| Ferramenta                       | Uso                                                              |
|----------------------------------|------------------------------------------------------------------|
| Bigin_getRecords                 | Listar contatos com filtros por campo, tag ou setor              |
| Bigin_searchRecords              | Buscar contato específico por email, nome ou critério            |
| Bigin_getSpecificRecord          | Detalhar um contato pelo seu ID                                  |
| Bigin_getRelatedListRecords      | Histórico de emails, notas e atividades de um contato            |
| Bigin_addRecords                 | Criar novo contato no CRM                                        |
| Bigin_updateSpecificRecord       | Atualizar campos de um contato                                   |
| Bigin_addTagsToSpecificRecord    | Marcar com tags (ex: "em-cadencia", "disc1")                     |
| Bigin_addNotesToSpecificRecord   | Registrar contexto qualitativo no contato                        |
| Bigin_getConfiguredFromAddresses | Listar endereços de email configurados para envio                |
| Bigin_sendEmails                 | Disparar email (imediato ou agendado com schedule_time)          |

---

## Capacidades MCP — NotebookLM

| Notebook                            | ID                                     | Uso                                              |
|-------------------------------------|----------------------------------------|--------------------------------------------------|
| Glassbox (principal, 111 fontes)    | d782441f-c9c2-43e6-bde0-d08a855928f4  | Casos de uso, métricas reais por setor           |
| Glassbox Strategy for Checkout      | 2fd8b6a5-8461-4570-aec4-4357ef7c4886  | Checkout, acessibilidade, e-commerce             |
| Customer Experience and SAC         | 0404212b-0530-4566-9a74-3554628d06f4  | Insights de CX, SAC, NPS                        |

---

## Workflow Completo de Campanha

### FASE 1 — Inteligência (NotebookLM)
1. Consulte o NotebookLM Glassbox com query sobre o setor alvo.
2. Extraia: dores específicas, casos de uso comprovados, métricas de impacto.

### FASE 2 — Curadoria de Contatos (Bigin → Local)
1. \`Bigin_getRecords\` → extrair por tag do setor.
2. \`Bigin_getRelatedListRecords\` → verificar etapa da cadência.
3. Salvar em \`files/contatos/<setor>_curado.csv\`.
4. \`Bigin_addTagsToSpecificRecord\` → marcar elegíveis.

### FASE 3 — Preparação de Conteúdo
1. Abrir/criar template HTML em \`Campanhas/_Modelos/Emails/\`.
2. Personalizar \`{{NOME}}\`, \`{{EMPRESA}}\`, \`{{INSIGHT_SETOR}}\`.

### FASE 4 — Execução (Bigin via MCP)
1. \`Bigin_getConfiguredFromAddresses\` → confirmar remetente.
2. \`Bigin_sendEmails\` → disparar com HTML final.
3. \`Bigin_addNotesToSpecificRecord\` → registrar: "Email 1 - Cadência Telecom - [data]".
`;
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
async function main() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║   Digital Monk — Marketing Hub  •  Setup Inicial        ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    const env = lerEnv();

    // ── Passo 1: Checar/pedir BIGIN_MCP_URL ──────────────────
    if (env.BIGIN_MCP_URL && env.BIGIN_MCP_URL.startsWith('https://')) {
        console.log('✅ BIGIN_MCP_URL já configurada no .env. Pulando configuração.');
    } else {
        console.log('🔑 Configure a conexão com o Bigin CRM (Zoho)\n');
        console.log('   Como obter a URL:');
        console.log('   1. Acesse: https://bigin.zoho.com');
        console.log('   2. Vá em  Configurações > Desenvolvedor > MCP');
        console.log('   3. Clique em "Gerar URL MCP"');
        console.log('   4. Copie a URL completa (já inclui a chave de autenticação)');
        console.log('\n   Formato esperado:');
        console.log('   https://SEU-DOMINIO.zohomcp.com/mcp/message?key=SUA_CHAVE\n');

        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        let url = '';

        while (!url.startsWith('https://')) {
            url = (await perguntar(rl, '   Cole a URL do Bigin MCP aqui: ')).trim();
            if (!url.startsWith('https://')) {
                console.log('   ⚠️  URL inválida. Deve começar com https://\n');
            }
        }

        rl.close();
        escreverEnv('BIGIN_MCP_URL', url);
        console.log('\n   ✅ URL salva no .env com sucesso!\n');

        // ── Passo 2: Testar conexão ───────────────────────────
        console.log('🔗 Testando conexão com o Bigin MCP...');
        try {
            const qtdTools = await testarConexao(url);
            console.log(`   ✅ Conexão estabelecida! ${qtdTools} ferramentas disponíveis.\n`);
        } catch (err) {
            console.log(`   ⚠️  Não foi possível testar a conexão agora: ${err.message}`);
            console.log('   Execute "npm run test-conexao" depois de garantir que a URL está correta.\n');
        }
    }

    // ── Passo 3: Gerar/atualizar .mcp.json (Antigravity) ─────
    const mcpJsonPath = path.join(root, '.mcp.json');
    const biginUrl = lerEnv().BIGIN_MCP_URL || '';

    let mcpConfig = { mcpServers: {} };
    if (fs.existsSync(mcpJsonPath)) {
        try { mcpConfig = JSON.parse(fs.readFileSync(mcpJsonPath, 'utf-8')); }
        catch { /* mantém o default se o JSON estiver corrompido */ }
    }

    // Injeta/atualiza o servidor Bigin usando transporte HTTP nativo do MCP SDK
    mcpConfig.mcpServers = mcpConfig.mcpServers || {};
    mcpConfig.mcpServers['bigin'] = {
        type: 'http',
        url: biginUrl,
        description: 'Zoho Bigin CRM — contatos, emails e notas via MCP HTTP'
    };

    fs.writeFileSync(mcpJsonPath, JSON.stringify(mcpConfig, null, 2), 'utf-8');
    console.log('⚙️  .mcp.json atualizado — Antigravity reconhecerá o servidor Bigin automaticamente.');
    console.log('   Reinicie o Antigravity/VS Code para ativar o servidor MCP, se necessário.\n');

    // ── Passo 4: Gerar AGENT.md ───────────────────────────────
    fs.writeFileSync(agentMdPath, agentMdConteudo(), 'utf-8');
    console.log('📋 AGENT.md atualizado com instruções completas de uso.\n');

    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║  Tudo pronto! Próximos passos:                          ║');
    console.log('║                                                          ║');
    console.log('║  npm run test-conexao   → Verificar conexão Bigin       ║');
    console.log('║  npm run start-campaign → Iniciar uma campanha           ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
}

main().catch(err => {
    console.error('\n❌ Erro no setup:', err.message);
    process.exit(1);
});
