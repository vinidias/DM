# 🚀 Digital Monk Marketing Hub

Hub de inteligência e automação de marketing B2B conectado ao Bigin CRM (Zoho) e ao NotebookLM via MCP.

---

## ⚡ Como usar (sem instalação)

**1. Clone o repositório**
```bash
git clone https://github.com/vinidias/DM.git
```

**2. Abra a pasta no Antigravity**

**3. Reinicie o Antigravity** → o servidor Bigin MCP é ativado automaticamente

**4. Cole o prompt abaixo no chat e comece** 👇

---

## 💬 Prompt de Início

Cole este prompt no chat do Antigravity para ativar o agente:

```
Leia o AGENT.md deste projeto e me confirme quais ferramentas MCP estão disponíveis. Estou pronto para planejar uma nova campanha.
```

---

## 📁 Estrutura do Projeto

```
DM/
├── Campanhas/
│   ├── _Modelos/
│   │   ├── Emails/          ← Templates HTML de email (cada etapa)
│   │   └── Artigos/         ← Modelos de artigo LinkedIn
│   └── Glassbox 2026/       ← Campanha ativa com emails e post LinkedIn
├── _sistema/
│   ├── config/setores.json  ← Setores alvo com queries NotebookLM
│   ├── mcp/                 ← Scripts de referência MCP
│   └── scripts/             ← Automação Node.js (opcional)
├── .mcp.json                ← Configuração MCP automática (Bigin)
├── AGENT.md                 ← Instruções completas do agente
└── PROMPT_INICIO.md         ← Prompt pronto para colar no chat
```

---

## 🔧 O que o agente consegue fazer

| Ação | Como pedir no chat |
|---|---|
| Planejar campanha para um setor | *"Planeje uma campanha para o setor financeiro"* |
| Buscar contatos no Bigin | *"Liste os contatos com a tag telecom"* |
| Criar email personalizado | *"Crie o email 1 para [Nome] da [Empresa]"* |
| Disparar email via CRM | *"Envie o email para [Nome]"* |
| Buscar insights no NotebookLM | *"Quais são as principais dores do setor de seguros?"* |
| Registrar etapa no contato | *"Registre que enviamos o Email 1 para [Nome] hoje"* |

---

## 🧠 Fontes de Inteligência (NotebookLM)

| Notebook | Para que serve |
|---|---|
| Glassbox (111 fontes) | Casos de uso, métricas reais, dores por setor |
| Glassbox Checkout | E-commerce, acessibilidade, checkout |
| Customer Experience & SAC | Insights de CX, NPS, atendimento |

---

> **Node.js é opcional.** A conexão com o Bigin MCP é HTTP nativa — basta clonar e abrir no Antigravity.
> Para usar os scripts de automação em lote: `npm install && npm run start-campaign`
