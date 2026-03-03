/**
 * Agente de Integração CRM (O Vendedor Interno)
 * Versão: 1.0.0
 * 
 * Responsável por garantir que os leads sejam cadastrados corretamente no Pipedrive,
 * evitando duplicidade de Organizações.
 */

require('dotenv').config();
const axios = require('axios');

class PipedriveIntegration {
    constructor() {
        this.apiToken = process.env.PIPEDRIVE_API_TOKEN;
        this.companyDomain = 'company'; // Opcional, dependendo da URL da API
        this.baseUrl = `https://api.pipedrive.com/v1`;

        if (!this.apiToken) {
            throw new Error('ERRO: A variável de ambiente PIPEDRIVE_API_TOKEN não foi configurada.');
        }
    }

    /**
     * Fluxo principal: Processa uma lista de leads para o Pipedrive.
     * @param {Array} leads Lista de leads vindos do Scraper.
     */
    async syncLeads(leads) {
        console.log(`[PIPEDRIVE] Iniciando sincronização de ${leads.length} leads...`);
        const results = { criados: 0, ignorados: 0, erros: 0 };

        for (const lead of leads) {
            try {
                // 1. Verificar se a Organização já existe
                let orgId = await this.findOrganization(lead.nome);

                if (!orgId) {
                    // 2. Criar Organização se não existir
                    orgId = await this.createOrganization(lead);
                    console.log(`[PIPEDRIVE] Organização criada: ${lead.nome} (ID: ${orgId})`);
                    results.criados++;
                } else {
                    console.log(`[PIPEDRIVE] Organização já existente: ${lead.nome} (ID: ${orgId}). Ignorando criação.`);
                    results.ignorados++;
                    // Opcional: Poderíamos atualizar os dados aqui se necessário
                }

                // 3. Criar Negócio (Deal) atrelado à Organização
                // Nota: Criamos o Deal mesmo se a Org já existe, pois pode ser uma nova prospecção,
                // mas isso pode ser ajustado conforme a regra de negócio.
                await this.createDeal(orgId, lead);

            } catch (error) {
                console.error(`[PIPEDRIVE] Erro ao processar lead ${lead.nome}:`, error.message);
                results.erros++;
            }
        }

        return results;
    }

    /**
     * Busca uma organização pelo nome exato para evitar duplicatas.
     */
    async findOrganization(name) {
        try {
            const response = await axios.get(`${this.baseUrl}/organizations/search`, {
                params: {
                    term: name,
                    fields: 'name',
                    exact_match: true,
                    api_token: this.apiToken
                }
            });

            const items = response.data.data.items;
            return items.length > 0 ? items[0].item.id : null;
        } catch (error) {
            console.error('[PIPEDRIVE] Erro na busca de organização:', error.message);
            return null;
        }
    }

    /**
     * Cria uma nova organização no Pipedrive.
     */
    async createOrganization(lead) {
        const response = await axios.post(`${this.baseUrl}/organizations?api_token=${this.apiToken}`, {
            name: lead.nome,
            address: lead.endereco,
            phone: lead.telefone !== 'N/A' ? lead.telefone : null
        });

        return response.data.data.id;
    }

    /**
     * Cria um negócio (Deal) no funil padrão.
     */
    async createDeal(orgId, lead) {
        try {
            // Título do negócio segue o padrão: [MAPS] Nome da Empresa
            await axios.post(`${this.baseUrl}/deals?api_token=${this.apiToken}`, {
                title: `[MAPS] ${lead.nome}`,
                org_id: orgId,
                status: 'open',
                // Adicionando informações extras nas notas do negócio
                content: `<b>Site:</b> ${lead.site}<br><b>E-mail Capturado:</b> ${lead.email || 'N/A'}<br><b>Telefone:</b> ${lead.telefone}<br><b>Endereço:</b> ${lead.endereco}`
            });
        } catch (error) {
            console.error('[PIPEDRIVE] Erro ao criar Negócio:', error.message);
        }
    }
}

module.exports = PipedriveIntegration;
