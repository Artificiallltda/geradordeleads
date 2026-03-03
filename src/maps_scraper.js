/**
 * Agente Scraper Maps (O Pesquisador Local)
 * Versão: 1.0.0
 * 
 * Este script é responsável por buscar empresas locais via Google Places API (v1).
 * 
 * Dependências necessárias:
 * npm install axios dotenv
 */

require('dotenv').config();
const axios = require('axios');

/**
 * Classe responsável pela extração de dados do Google Maps.
 */
class MapsScraper {
    constructor() {
        this.apiKey = process.env.GOOGLE_PLACES_API_KEY;
        this.apiUrl = 'https://places.googleapis.com/v1/places:searchText';
        
        if (!this.apiKey) {
            throw new Error('ERRO: A variável de ambiente GOOGLE_PLACES_API_KEY não foi configurada no arquivo .env.');
        }
    }

    /**
     * Realiza a busca de estabelecimentos por termo.
     * @param {string} textQuery O termo de busca (Ex: "Clínicas de Estética em São Paulo").
     * @returns {Promise<Array>} Lista de leads formatados.
     */
    async searchPlaces(textQuery) {
        console.log(`[MAPS-SCRAPER] Iniciando busca por: "${textQuery}"...`);

        try {
            // Documentação dos Fields: https://developers.google.com/maps/documentation/places/web-service/place-search-v1#fieldmask
            const response = await axios.post(
                this.apiUrl,
                { textQuery },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': this.apiKey,
                        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.websiteUri,places.internationalPhoneNumber,places.id'
                    }
                }
            );

            const places = response.data.places || [];
            console.log(`[MAPS-SCRAPER] Foram encontrados ${places.length} estabelecimentos.`);

            return this.formatLeads(places);
        } catch (error) {
            console.error('[MAPS-SCRAPER] Falha na requisição:', error.response ? error.response.data : error.message);
            throw new Error('Erro ao buscar dados no Google Places API.');
        }
    }

    /**
     * Formata os dados brutos da API em um JSON limpo para o sistema.
     * @param {Array} rawPlaces Dados brutos recebidos da API.
     * @returns {Array} Leads formatados.
     */
    formatLeads(rawPlaces) {
        return rawPlaces.map(place => ({
            id_google: place.id,
            nome: place.displayName?.text || 'N/A',
            endereco: place.formattedAddress || 'N/A',
            telefone: place.internationalPhoneNumber || 'N/A',
            site: place.websiteUri || 'N/A',
            rating: place.rating || 0,
            origem: 'Google Maps'
        }));
    }
}

// Exporta para ser usado pelo Agente Coordenador ou outros módulos
module.exports = MapsScraper;

/**
 * Script de Teste (Execução direta via node src/maps_scraper.js)
 */
if (require.main === module) {
    (async () => {
        const scraper = new MapsScraper();
        try {
            const termoBusca = process.argv[2] || "Clínicas de Estética em São Paulo";
            const leads = await scraper.searchPlaces(termoBusca);
            
            console.log('
--- Resultado da Extração (Primeiros 3 Leads) ---');
            console.log(JSON.stringify(leads.slice(0, 3), null, 2));
            
            // Aqui poderíamos salvar em arquivo no futuro se necessário
        } catch (err) {
            console.error('[MAIN] Erro:', err.message);
        }
    })();
}
