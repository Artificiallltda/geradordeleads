/**
 * Agente de Integração CRM (O Vendedor Interno)
 * Versão: 2.0.0
 *
 * Responsável por garantir que os leads sejam cadastrados corretamente no Pipedrive,
 * evitando duplicidade de Organizações.
 *
 * SEGURANÇA: O api_token é enviado via header (x-api-token) e nunca fica exposto na URL.
 */

require('dotenv').config();
const axios = require('axios');

class PipedriveIntegration {
    constructor() {
        this.useMock = process.env.USE_MOCK === 'true';
        this.apiToken = process.env.PIPEDRIVE_API_TOKEN;
        this.baseUrl = 'https://api.pipedrive.com/v1';

        if (!this.apiToken && !this.useMock) {
            throw new Error('ERRO: A variável de ambiente PIPEDRIVE_API_TOKEN não foi configurada no arquivo .env.');
        }

        // Instância axios com header de autenticação seguro (não expõe token na URL)
        this.http = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'x-api-token': this.apiToken || ''
            },
            timeout: 15000
        });
    }

    /**
     * Fluxo principal: Processa uma lista de leads para o Pipedrive.
     */
    async syncLeads(leads) {
        console.log(`[PIPEDRIVE] Iniciando sincronização de ${leads.length} leads...`);

        if (this.useMock) {
            console.log(`[PIPEDRIVE] 🧪 MODO MOCK: Simulando criação de ${leads.length} deals no CRM...`);
            return { criados: leads.length, ignorados: 0, erros: 0 };
        }

        const results = { criados: 0, ignorados: 0, erros: 0 };

        for (const lead of leads) {
            try {
                // 1. Verificar se a Organização já existe
                let orgId = await this.findOrganization(lead.nome);

                if (!orgId) {
                    // 2. Criar Organização se não existir
                    orgId = await this.createOrganization(lead);
                    console.log(`[PIPEDRIVE] ✅ Organização criada: ${lead.nome} (ID: ${orgId})`);
                    results.criados++;
                } else {
                    console.log(`[PIPEDRIVE] ⏭️  Já existe: ${lead.nome} (ID: ${orgId}). Ignorando.`);
                    results.ignorados++;
                }

                // 3. Criar Negócio (Deal) atrelado à Organização
                await this.createDeal(orgId, lead);

            } catch (error) {
                console.error(`[PIPEDRIVE] ❌ Erro ao processar "${lead.nome}": ${error.message}`);
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
            const response = await this.http.get('/organizations/search', {
                params: { term: name, fields: 'name', exact_match: true }
            });

            const items = response.data?.data?.items || [];
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
        const response = await this.http.post('/organizations', {
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
            const origem = lead.origem || 'MAPS';
            await this.http.post('/deals', {
                title: `[${origem}] ${lead.nome}`,
                org_id: orgId,
                status: 'open',
                content: `<b>Site:</b> ${lead.site}<br><b>E-mail:</b> ${lead.email || 'N/A'}<br><b>Telefone:</b> ${lead.telefone}<br><b>Endereço:</b> ${lead.endereco}<br><b>Rating:</b> ${lead.rating || 'N/A'}`
            });
        } catch (error) {
            console.error('[PIPEDRIVE] ❌ Erro ao criar Negócio:', error.message);
        }
    }
}

module.exports = PipedriveIntegration;
