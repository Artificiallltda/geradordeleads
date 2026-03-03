/**
 * Agente Coordenador (Maestro) - Gerador de Leads
 * Versão: 1.3.0
 * 
 * Este arquivo centraliza o controle das operações de extração, enriquecimento e integração.
 * Suporta múltiplas origens: Maps ou LinkedIn.
 */

const MapsScraper = require('./maps_scraper');
const LinkedInScraper = require('./linkedin_scraper');
const DataEnricher = require('./data_enricher');
const PipedriveIntegration = require('./pipedrive_integration');

async function main() {
    const termoBusca = process.argv[2];
    const fonte = process.argv[3] || 'maps'; // Default para maps

    if (!termoBusca) {
        console.error('Uso: npm start "Termo de Busca" [maps|linkedin]');
        process.exit(1);
    }

    try {
        let rawLeads = [];

        // Passo 1: Escolha do Scraper (Delegação)
        if (fonte.toLowerCase() === 'linkedin') {
            const scraper = new LinkedInScraper();
            rawLeads = await scraper.searchPeople(termoBusca);
        } else {
            const scraper = new MapsScraper();
            rawLeads = await scraper.searchPlaces(termoBusca);
        }

        if (rawLeads.length === 0) {
            console.log('[MAESTRO] Nenhum lead encontrado. Encerrando.');
            return;
        }

        // Passo 2: Enriquecimento de Dados
        const enricher = new DataEnricher();
        const enrichedLeads = await enricher.enrichLeads(rawLeads);

        // Passo 3: Integração CRM
        const crm = new PipedriveIntegration();
        const resPipedrive = await crm.syncLeads(enrichedLeads);

        console.log('\n=============================================');
        console.log(`RESUMO DA OPERAÇÃO (${fonte.toUpperCase()}):`);
        console.log(`- Leads extraídos: ${rawLeads.length}`);
        console.log(`- Sincronizados no CRM: ${resPipedrive.criados + resPipedrive.ignorados}`);
        console.log('\nSquad GeanAIOS - Operação Concluída.');
        console.log('=============================================\n');

    } catch (error) {
        console.error('\n[MAESTRO] Falha crítica no fluxo:', error.message);
        process.exit(1);
    }
}

main();
