# Estrutura do Squad de Agentes (GeanAIOS) - Gerador de Leads

Este documento define a arquitetura multiagente para a operação e construção do Gerador de Leads no ecossistema AIOS. 

A abordagem de delegação garante que cada etapa do funil (pesquisa, extração, tratamento e envio) seja feita por especialistas, garantindo modularidade na manutenção.

## 1. Agente Coordenador (O Maestro)
- **Papel:** Receber o input do usuário (via interface ou terminal) e determinar o fluxo de execução.
- **Responsabilidades:** 
  - Validar se os parâmetros estão corretos (Termo de busca, Fonte: Maps/LinkedIn).
  - Acionar o Agente Scraper correto para o trabalho.
  - Receber os dados brutos e passá-los para o Enriquecedor.
  - Receber os dados limpos e acionar a Integração CRM.
- **Ferramentas:** Acesso à comunicação entre agentes.

## 2. Agente Scraper Maps (O Pesquisador Local)
- **Papel:** Especialista em varredura geográfica e de negócios locais.
- **Responsabilidades:** 
  - Consumir a Google Places API.
  - Tratar paginação de resultados.
  - Retornar um JSON estruturado com os dados dos estabelecimentos (site, tel, etc).
- **Ferramentas:** Google Places API, Request Library.

## 3. Agente Scraper LinkedIn (O Headhunter)
- **Papel:** Especialista em navegação web e simulação de perfil humano.
- **Responsabilidades:** 
  - Instanciar navegador headless (Playwright/Puppeteer).
  - Executar login, buscar palavras-chave e raspar HTML da página de forma segura.
  - Aplicar pausas aleatórias (Human-like behavior).
- **Ferramentas:** Playwright, Puppeteer.

## 4. Agente Enriquecedor de Dados (O Tratador)
- **Papel:** Melhorar a qualidade do dado bruto recebido dos Scrapers.
- **Responsabilidades:** 
  - Usar processamento de linguagem natural para retirar LTDA, ME, S.A dos nomes de empresas.
  - Se receber uma URL (ex: site de clínica), acessar o site via request simples e usar regex para encontrar endereços de e-mail (Ex: contato@clinica.com).
  - Formatar números de telefone para o padrão Pipedrive (+55...).
- **Ferramentas:** Regex, LLM (Gemini/OpenAI) para formatação de nomes, Request Library (para buscar emails em sites).

## 5. Agente de Integração CRM (O Vendedor Interno)
- **Papel:** Cadastrar a informação no destino final, garantindo a governança de dados.
- **Responsabilidades:** 
  - Consultar Pipedrive se Contato/Empresa já existe (Evitar duplicidade).
  - Criar "Organization".
  - Criar "Person" e atrelar à Organization.
  - Criar "Deal" (Negócio) na fase de Prospecção do funil selecionado.
- **Ferramentas:** Pipedrive REST API, token de autenticação.
