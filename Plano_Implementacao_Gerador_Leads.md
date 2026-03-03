# Plano de Implementação: Ferramenta de Captura de Leads (Alternativa ao PhantomBuster)

## 1. Visão Geral do Projeto
O objetivo deste projeto é desenvolver uma ferramenta interna, customizada e livre de mensalidades contínuas de prateleira (como o PhantomBuster), capaz de extrair potenciais clientes (leads) do Google Maps e LinkedIn, enriquecê-los e cadastrá-los automaticamente no CRM Pipedrive.

**Benefícios Esperados:**
- Redução a zero do tempo de prospecção manual da equipe de vendas.
- Total controle sobre as lógicas de pesquisa e funis do Pipedrive.
- Ausência de limitações artificiais de extração e preços baseados em volume (paga-se apenas os custos base da infraestrutura e APIs).

---

## 2. Arquitetura da Solução

A ferramenta será dividida em 3 Módulos Principais:
1. **Motores de Extração (Scrapers):** Google Maps e LinkedIn.
2. **Camada de Processamento e Enriquecimento:** Tratamento dos dados e uso de Inteligência Artificial para limpeza.
3. **Módulo de Sincronização e CRM:** Envio direto para o Pipedrive.
4. **Interface de Operação (Painel):** Tela para uso da equipe sem necessidade de código (No-Code).

---

## 3. Fases de Desenvolvimento

### Fase 1: Motor do Google Maps + Pipedrive (MVP - Mínimo Produto Viável)
**Foco:** Captura rápida de empresas locais estabelecidas (Mapeamento de B2B regional).
- **Extração:** Consumo da **Google Places API** (Oficial). Recebe um termo (Ex: "Clínicas de Estética em São Paulo") e retorna dezenas de estabelecimentos.
- **Dados Capturados:** Nome da Empresa, Endereço Completo, Telefone, Website, Nota de Avaliação (Rating) e Quantidade de Avaliações.
- **Integração Pipedrive:** 
  - Criação automática da Organização (Empresa).
  - Criação do Negócio (Deal) na primeira etapa do funil "Prospecção", contendo link do site e telefone nas notas do negócio.
- **Estimativa de Tempo:** 1 a 2 semanas.

### Fase 2: Motor de Extração do LinkedIn 
**Foco:** Capturar tomadores de decisão específicos (B2B Corporativo/Cargos de Chefia).
- **Extração:** Automação via **Playwright** ou **Puppeteer** (simulando um navegador real operado por um humano para evitar bloqueios). O robô fará login na conta do LinkedIn e navegará pelas páginas de busca.
- **Dados Capturados:** Nome do Lead, Cargo Atual, Empresa, Link do Perfil, Resumo.
- **Segurança:** Implementação de limite diário de perfis (ex: 80-100 por dia/conta), delays aleatórios entre ações para imitar comportamento humano (Human-Like Behavior).
- **Estimativa de Tempo:** 2 semanas.

### Fase 3: Enriquecimento, Limpeza de Dados e E-mails
**Foco:** Transformar dados brutos em inteligência comercial.
- **Tratamento por IA:** Uso do **Google Gemini** ou OpenAI para corrigir nomes corporativos inteiros (ex: de "HOSPITAL SAO LUCAS LTDA - ME" para "Hospital São Lucas") e deduzir os melhores horários/perfis para abordagem.
- **Hunter de E-mails (Opcional):** Um sub-módulo que acessa a página corporativa extraída do Google Maps e procura ativamente as tags `<a href="mailto:">` ou sessões de "Contato" para raspar os e-mails da diretoria/vendas.
- **Estimativa de Tempo:** 1 semana.

### Fase 4: Interface do Usuário (O "PhantomBuster" da sua Equipe)
**Foco:** Facilidade de uso pelo time Comercial/Marketing.
- **Front-end Simples:** Uma aplicação usando **Streamlit (Python)** ou **React/Node.js**.
- **Funcionalidades da Tela:** 
  - Campo de texto para as Palavras-Chaves.
  - Seletor da origem (LinkedIn ou Google Maps).
  - Seleção de qual Funil/Etapa do Pipedrive os dados devem cair.
  - Botão **[ INICIAR CAPTURA ]**.
  - Tabela com resultados em tempo real do processamento do robô.
- **Estimativa de Tempo:** 1 a 2 semanas.

---

## 4. Stack Tecnológico Sugerido
- **Back-end & Scrapers:** Python (devido à sua superioridade no manejo de dados e vastas bibliotecas de scraping) ou Node.js (se for preferência da equipe atual).
- **Automação de Navegador:** Playwright (mais robusto contra detecções do LinkedIn).
- **APIs Necessárias:** Google Places API, Pipedrive REST API, API de LLM (Gemini).
- **Hospedagem / Deploy:** Railway (para manter a aplicação web e os robôs rodando na nuvem sem necessidade de máquinas locais ativas 24h).
- **Banco de Dados (Cache):** SQLite ou PostgreSQL simples para evitar cadastros duplicados (armazenar IDs que já foram enviados ao Pipedrive).

---

## 5. Próximos Passos (Call to Action)
1. Aprovar esta arquitetura.
2. Criar uma API Key do Google Cloud Console para o Places API.
3. Obter o "Personal API Token" de uma conta administradora do Pipedrive.
4. (Opcional) Separar uma conta "B" do LinkedIn para conectar ao robô, para poupar a conta principal.
5. Iniciar o desenvolvimento da Fase 1.
