#!/bin/bash
# ══════════════════════════════════════════════════════════════
#  Digital Monk Marketing Hub — Setup Inicial
#  Configura a conexão com o Bigin CRM (Zoho MCP HTTP)
#  Não requer Node.js, npm ou qualquer dependência externa.
# ══════════════════════════════════════════════════════════════
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$ROOT/.env"
MCP_JSON="$ROOT/.mcp.json"
AGENT_MD="$ROOT/AGENT.md"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   Digital Monk — Marketing Hub  •  Setup Inicial        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ──────────────────────────────────────────────────────────────
# 1. Verificar/pedir BIGIN_MCP_URL
# ──────────────────────────────────────────────────────────────
BIGIN_URL=""

# Tenta ler do .env existente
if [ -f "$ENV_FILE" ]; then
    BIGIN_URL=$(grep "^BIGIN_MCP_URL=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '"')
fi

if [[ "$BIGIN_URL" == https://* ]]; then
    echo "✅ BIGIN_MCP_URL já configurada no .env. Pulando configuração."
else
    echo "🔑 Configure a conexão com o Bigin CRM (Zoho)"
    echo ""
    echo "   Como obter a URL:"
    echo "   1. Acesse: https://bigin.zoho.com"
    echo "   2. Vá em  Configurações > Desenvolvedor > MCP"
    echo "   3. Clique em 'Gerar URL MCP'"
    echo "   4. Copie a URL completa (já inclui a chave)"
    echo ""
    echo "   Formato esperado:"
    echo "   https://SEU-DOMINIO.zohomcp.com/mcp/message?key=SUA_CHAVE"
    echo ""

    while true; do
        read -r -p "   Cole a URL do Bigin MCP aqui: " BIGIN_URL
        if [[ "$BIGIN_URL" == https://* ]]; then
            break
        fi
        echo "   ⚠️  URL inválida. Deve começar com https://"
        echo ""
    done

    # Escreve no .env
    if [ -f "$ENV_FILE" ]; then
        # Atualiza linha existente
        if grep -q "^BIGIN_MCP_URL=" "$ENV_FILE"; then
            sed -i.bak "s|^BIGIN_MCP_URL=.*|BIGIN_MCP_URL=$BIGIN_URL|" "$ENV_FILE" && rm -f "$ENV_FILE.bak"
        else
            echo "BIGIN_MCP_URL=$BIGIN_URL" >> "$ENV_FILE"
        fi
    else
        # Cria .env do zero baseado no .env.example
        if [ -f "$ROOT/.env.example" ]; then
            cp "$ROOT/.env.example" "$ENV_FILE"
            sed -i.bak "s|^BIGIN_MCP_URL=.*|BIGIN_MCP_URL=$BIGIN_URL|" "$ENV_FILE" && rm -f "$ENV_FILE.bak"
        else
            echo "BIGIN_MCP_URL=$BIGIN_URL" > "$ENV_FILE"
        fi
    fi

    echo ""
    echo "   ✅ URL salva em .env"
    echo ""
fi

# ──────────────────────────────────────────────────────────────
# 2. Testar conexão via curl (sem Node.js)
# ──────────────────────────────────────────────────────────────
echo "🔗 Testando conexão com o Bigin MCP via curl..."

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$BIGIN_URL" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"dm-setup","version":"1.0"}}}' \
    --max-time 10 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "   ✅ Bigin MCP respondeu com HTTP 200 — conexão OK!"
elif [ "$HTTP_STATUS" = "000" ]; then
    echo "   ⚠️  Timeout ou erro de rede. Verifique a URL e tente: bash setup.sh"
else
    echo "   ⚠️  Resposta HTTP $HTTP_STATUS. Verifique se a URL e a chave estão corretas."
fi
echo ""

# ──────────────────────────────────────────────────────────────
# 3. Gerar .mcp.json (Antigravity reconhece automaticamente)
# ──────────────────────────────────────────────────────────────
cat > "$MCP_JSON" <<EOF
{
  "mcpServers": {
    "bigin": {
      "type": "http",
      "url": "$BIGIN_URL",
      "description": "Zoho Bigin CRM — contatos, emails e notas via MCP HTTP"
    }
  }
}
EOF

echo "⚙️  .mcp.json gerado — reinicie o Antigravity para ativar o servidor Bigin MCP."
echo ""

# ──────────────────────────────────────────────────────────────
# 4. Atualizar AGENT.md
# ──────────────────────────────────────────────────────────────
cat > "$AGENT_MD" << 'AGENTEOF'
# Digital Monk Marketing Hub — Instruções do Agente

## Persona do Agente
Você é um **Estrategista Sênior de Marketing B2B** com 15+ anos de experiência em Growth, Inbound e Account-Based Marketing (ABM). Você **educa, informa e cria valor primeiro** — nunca faz pitch agressivo.

Seu objetivo é ajudar a Digital Monk a construir relações com lideranças de CX, Digital e Produto nos setores-alvo (Telecom, Financeiro, Varejo, Seguros), usando o Glassbox como veículo de inteligência.

## Como Funciona a Conexão MCP

### Bigin CRM (Zoho)
- Tipo: **HTTP remoto** (sem Node.js, sem processo local)
- Configurado em: `.mcp.json` (gerado pelo `setup.sh`)
- Fonte de verdade: os contatos vivem no Bigin CRM

### NotebookLM
- Tipo: Processo local (`npx notebooklm-mcp-cli`)
- Notebooks relevantes:
  - `d782441f` — Glassbox (111 fontes, uso geral)
  - `2fd8b6a5` — Glassbox Checkout & Acessibilidade
  - `0404212b` — Customer Experience e SAC

---

## Ferramentas Bigin Disponíveis

| Ferramenta                       | Uso                                          |
|----------------------------------|----------------------------------------------|
| Bigin_getRecords                 | Listar contatos por tag/setor                |
| Bigin_searchRecords              | Buscar contato por email ou critério         |
| Bigin_getRelatedListRecords      | Histórico de emails e notas de um contato    |
| Bigin_addRecords                 | Criar novo contato                           |
| Bigin_updateSpecificRecord       | Atualizar campos de um contato               |
| Bigin_addTagsToSpecificRecord    | Marcar com tags (ex: "em-cadencia")          |
| Bigin_addNotesToSpecificRecord   | Registrar contexto no contato                |
| Bigin_getConfiguredFromAddresses | Ver endereços de email configurados          |
| Bigin_sendEmails                 | Disparar email (imediato ou agendado)        |

---

## Workflow de Campanha

1. **Inteligência** → Consultar NotebookLM sobre dores do setor alvo
2. **Curadoria** → `Bigin_getRecords` por tag > verificar histórico > filtrar elegíveis
3. **Conteúdo** → Personalizar template em `Campanhas/_Modelos/Emails/`
4. **Disparo** → `Bigin_sendEmails` + `Bigin_addNotesToSpecificRecord` para registrar etapa

---

## Estrutura do Projeto

```
dm-marketing-automations/
├── Campanhas/
│   ├── _Modelos/          # Templates reutilizáveis (emails, artigos)
│   └── Glassbox 2026/     # Campanha ativa
├── _sistema/
│   ├── config/setores.json
│   └── mcp/               # Scripts de referência MCP
├── setup.sh               # Setup inicial (sem Node.js)
├── .mcp.json              # Config Antigravity (gerado pelo setup)
├── .env                   # Segredos (nunca commitar)
└── AGENT.md               # Este arquivo
```
AGENTEOF

echo "📋 AGENT.md atualizado."
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Tudo pronto! Próximos passos:                          ║"
echo "║                                                          ║"
echo "║  bash setup.sh       → Reconfigurar conexão             ║"
echo "║  bash test-conexao.sh → Testar a conexão Bigin          ║"
echo "║  (Reinicie o Antigravity para ativar o Bigin MCP)       ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
