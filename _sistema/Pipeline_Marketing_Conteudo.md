# Pipeline de Marketing de Conteúdo — Referência e Instrução de Setup

> Plano aprovado em 27/02/2026. Criação manual do Pipeline é necessária pela interface do Bigin.

## O Que é Este Pipeline

Um Pipeline Kanban no Bigin CRM dedicado ao ciclo de vida de cada **Peça de Conteúdo de Marketing** — artigos LinkedIn, emails, posts de redes sociais e publicações no WordPress.

Cada card representa **uma peça individual de conteúdo**, não um lead ou negociação.

---

## Estágios do Kanban para Criar no Bigin

| # | Nome do Estágio | O que representa |
|---|-----------------|-----------------|
| 1 | 💡 Ideia / Briefing | Tema identificado, hipótese sem copy |
| 2 | ✍️ Produção | Copy sendo redigido no repositório Git |
| 3 | 🖼️ Imagens & Mídia | Copy pronto, imagens sendo geradas (Gemini/NotebookLM) |
| 4 | ✅ Aprovação | Todas as peças prontas, aguardando revisão final |
| 5 | 📧 Email Agendado | Disparo via Bigin `sendEmails` configurado |
| 6 | 📝 Publicado (WP/LinkedIn) | Artigo publicado ou post ao ar |
| 7 | 🔁 Republicação | Peça reformatada para canais secundários |
| 8 | ✔️ Concluído | KPIs registrados nas notas, ciclo encerrado |

---

## Campos Personalizados para Adicionar ao Layout

| Campo | Tipo | Exemplos de Valor |
|-------|------|--------------------|
| Tipo de Conteúdo | Lista | Email / Artigo LinkedIn / Post Social / WP |
| Campanha | Texto | "Glassbox 2026", "Varejo Q2" |
| Público-alvo | Lista | Head de CX / Diretor de Produto / PM |
| Tema / Ângulo | Texto longo | A dor central abordada na peça |
| Link da Peça | URL | Link do `.md` no GitHub ou do artigo publicado |
| Data de Publicação | Data | Data planejada de publicação |
| Canal | Multi-seleção | LinkedIn / Email / WordPress / Instagram |
| Resultado (KPI) | Texto | Taxa de abertura, views, leads gerados |

---

## Como Criar no Bigin (Manual)

1. Acesse **Bigin → Configurações → Pipelines → Novo Pipeline**.
2. Nomeie como: **"Marketing de Conteúdo"** (ou similar).
3. Adicione os 8 estágios na ordem listada acima.
4. Em **Campos Personalizados**, adicione os campos da tabela acima.
5. Após criado, **anote o ID do Pipeline** (visível na URL ou via `Bigin_getLayoutsMetadata`) e informe ao agente para que ele passe a operar os cards via MCP.

---

## Integração com o Agente (Após Setup Manual)

Com o ID do Pipeline em mãos, o agente poderá:

- `Bigin_addRecords` → Criar um card no estágio "Ideia" assim que um tema for gerado
- `Bigin_updateSpecificRecord` → Avançar o card de estágio automaticamente
- `Bigin_addNotesToSpecificRecord` → Registrar KPIs ao finalizar cada peça
- `Bigin_getRecordsFromSpecificTeamPipeline` → Consultar o Kanban do mês para planejamento semanal

---

## Arquivos Relacionados no Repositório

- `Campanhas/_Modelos/Artigos/` — Artigos LinkedIn e Guias
- `Campanhas/_Modelos/Emails/` — Templates HTML de Email
- `.agents/workflows/calendario_marketing.md` — Workflow de execução
