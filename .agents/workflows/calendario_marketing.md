---
description: Gerar um plano transversal e calendário de conteúdo para Social Media e Email Marketing (B2B).
---

# Fluxo de Trabalho: Plano e Calendário de Marketing Digital (Email + Social)

Este fluxo orienta o agente na criação de uma estratégia unificada, garantindo que o conteúdo de redes sociais (como artigos de LinkedIn) esteja totalmente alinhado com o disparo de cadências de email marketing para a mesma campanha.

### Passos da Execução:

1. **Extração de Insights Baseados em Dados Reais (NotebookLM)**
   - Utilize a ferramenta `mcp_notebooklm_notebook_query` para consultar a base de conhecimento específica da campanha/produto.
   - Extraia as 3 principais *dores invisíveis* ou temas quentes enfrentados pelo público-alvo (Ex: CX, Analytics, Retenção).

2. **Criação do Calendário Editorial Transversal**
   - Elabore uma tabela em Markdown (`calendario_conteudo.md`) contendo a estratégia para 4 semanas.
   - Para cada semana, defina: 
     - 1 Tópico Central.
     - 1 Post de Social Media (LinkedIn) para gerar topo de funil (*awareness*).
     - 1 Email Marketing enviado na mesma semana oferecendo profundidade ou call-to-action bottom-funnel.

3. **Geração de Conteúdo Visual (Imagens para Social)**
   - Para cada post de social media planejado, utilize a tool `generate_image` ou extraia infográficos do NotebookLM para providenciar imagens de alta qualidade corporativa.
   - Salve os ativos na pasta da Campanha atual (ex: `Campanhas/Nome_da_Campanha/Artigos/`).

4. **Elaboração dos Textos (Copy) e Email**
   - Escreva o rascunho dos posts no formato `.md`.
   - Adapte um modelo de HTML em `Campanhas/_Modelos/Emails/` ou gere um novo template otimizado focado na mensagem da semana, garantindo taxa de abertura.

5. **Aprovação e Gerenciamento no Pipeline de Conteúdo (Bigin)**
   - Apresente o calendário e todas as peças criadas ao usuário para aprovação.
   - Após aprovado, crie um card por peça de conteúdo no **Pipeline "Marketing de Conteúdo"** do Bigin, usando `Bigin_addRecords` no estágio inicial "💡 Ideia / Briefing".
   - À medida que as peças forem entregues (copy, imagens, disparo de email), avance o card no Kanban com `Bigin_updateSpecificRecord` até os estágios "📧 Email Agendado" e "📝 Publicado".
   - Após a publicação, registre os KPIs nas notas do card com `Bigin_addNotesToSpecificRecord` e avance para "✔️ Concluído".
   - Para consultar o status atual do calendário: `Bigin_getRecordsFromSpecificTeamPipeline` com o ID do pipeline.
   - Referência completa: `_sistema/Pipeline_Marketing_Conteudo.md`

