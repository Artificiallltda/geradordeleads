# Product Requirements Document (PRD) - Gerador de Leads

## 1. Introdução
**Nome do Produto:** Gerador de Leads Automático (Alternativa Interna ao PhantomBuster)
**Objetivo:** Substituir a necessidade de ferramentas terceiras onerosas por uma solução própria de extração, enriquecimento e envio automático de leads (B2B) para o CRM Pipedrive.
**Público-Alvo:** Equipe de Vendas e SDRs (Sales Development Representatives).

## 2. Casos de Uso
1. **Busca Local por Nicho:** O usuário digita "Clínicas de Estética em São Paulo", e o sistema capta os dados do Google Maps das empresas da região e envia ao CRM.
2. **Busca Corporativa:** O usuário busca "CEO de Clínicas em São Paulo", e o sistema faz a extração de perfis do LinkedIn dos sócios/CEOs.

## 3. Escopo Funcional (Features)
- **Painel de Controle (UI Simples):** Permite inserir o termo de pesquisa, selecionar a fonte (Maps ou LinkedIn) e o destino no funil do Pipedrive.
- **Motor Google Maps:** Busca estabelecimentos via Google Places API (nome, endereço, telefone, website, rating).
- **Motor LinkedIn:** Automação de navegação para extração de profissionais (nome, empresa, cargo, perfil do LinkedIn) via Playwright.
- **Enriquecedor de Dados:** Limpeza de nome de empresas via IA (Gemini/OpenAI) e raspagem de emails a partir do website extraído do Maps.
- **Integração Pipedrive:** Envio via API para criação de "Organização", "Pessoa de Contato" e "Negócio" na etapa de prospecção.
- **Logs de Execução:** Histórico no painel mostrando o status de cada busca ("Extraídos 50, Salvos 48, Duplicados 2").

## 4. Requisitos Não Funcionais
- **Segurança da Conta LinkedIn:** Operar com limites diários (ex: max 80 perfis/dia) e delays humanos (random de 5 a 15 segundos entre ações).
- **Prevenção de Duplicidade:** O sistema deve verificar, tanto internamente (banco local ou cache) quanto via Pipedrive API, se o lead/empresa já existe antes de criá-lo.
- **Disponibilidade:** A solução deverá ser executada em um servidor em nuvem (ex: Railway), rodando de forma assíncrona.

## 5. Indicadores de Sucesso (KPIs)
- Redução de X horas/semana gastas com prospecção manual.
- Quantidade de leads qualificados gerados por semana.
- Custo de infraestrutura inferior à mensalidade da assinatura do PhantomBuster.
