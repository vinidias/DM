# Digital Monk — Marketing Hub

Hub de automação de campanhas B2B para a Digital Monk.
Integra **Bigin CRM**, **NotebookLM** (IA) e **Google Drive** para outreach inteligente.

---

## Estrutura do Workspace

```
📁 Campanhas/
│   └── _Modelos/
│       ├── Emails/          ← Templates HTML de email (edite aqui)
│       ├── Artigos/         ← Rascunhos para LinkedIn e Blog
│       └── COMO_USAR.md

📁 Assets/
│   ├── Imagens/             ← Logos e imagens das campanhas
│   └── Assinaturas/         ← Assinatura HTML de email
```

> Tudo técnico fica em `_sistema/` — não precisa ser tocado pelo time de Marketing.

---

## Setup (só na primeira vez)

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar o Bigin CRM

Copie o arquivo `.env.example` e renomeie para `.env`:

```bash
cp .env.example .env
```

Abra o `.env` e cole a URL gerada no painel do Bigin:
```
# Bigin > Configurações > Integrações > MCP → copie a URL
BIGIN_MCP_URL=https://SEU-DOMINIO.zohomcp.com/mcp/message?key=SUA_CHAVE
```

Valide a conexão:
```bash
npm run test-conexao
```

Se aparecer ✅, está tudo pronto.

### 3. Configurar o NotebookLM (IA de Conteúdo)

```bash
npx @google/notebooklm-mcp-cli login
```

O Chrome vai abrir para login com o Google. Só confirmar e fechar.

---

## Uso no dia a dia

**Rodar uma campanha:**
```bash
npm run start-campaign
```

> Antes de rodar: certifique-se que os contatos estão em `_sistema/contatos/curado.csv`.

**Ou simplesmente peça ao Antigravity:**
> *"Extrai os contatos de Telecom do Bigin e inicia a campanha de descoberta."*
