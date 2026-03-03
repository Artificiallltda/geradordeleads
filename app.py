import streamlit as st
import subprocess
import os
import sys

# Configuração da Página
st.set_page_config(
    page_title="Gerador de Leads B2B - GeanAIOS",
    page_icon="🎯",
    layout="centered"
)

# Estilos Customizados (Opcional)
st.markdown("""
    <style>
    .main {
        background-color: #f5f7f9;
    }
    .stButton>button {
        width: 100%;
        border-radius: 5px;
        height: 3em;
        background-color: #007bff;
        color: white;
    }
    </style>
    """, unsafe_allow_html=True)

# Título e Descrição
st.title("🎯 Gerador de Leads B2B")
st.subheader("Módulo Supremo (Maps + LinkedIn)")
st.write("Extraia, enriqueça com IA e envie leads direto para o Pipedrive em segundos.")

# Formulário de Busca
with st.container():
    st.info("💡 Dica: Digite o nicho e a cidade (Ex: 'Padarias em Curitiba')")
    
    col_t, col_f = st.columns([2, 1])
    with col_t:
        termo_busca = st.text_input("O que deseja prospectar?", placeholder="Ex: Clínicas de Estética em São Paulo")
    with col_f:
        fonte = st.radio("Origem:", ["Google Maps", "LinkedIn"], index=0)
    
    botao_iniciar = st.button("🚀 Iniciar Captura de Leads")

# Execução do Motor Node.js
if botao_iniciar:
    if not termo_busca:
        st.warning("⚠️ Por favor, insira um termo de busca antes de iniciar.")
    else:
        st.divider()
        st.write(f"### ⚙️ Processando: **{termo_busca}** via {fonte}")
        
        # Mapeamento da fonte para o parâmetro do script
        fonte_param = "maps" if fonte == "Google Maps" else "linkedin"
        
        # Área de Log em Tempo Real
        log_area = st.empty()
        full_log = ""
        
        # Caminho para o script Node.js
        script_path = os.path.join("src", "index.js")
        
        try:
            # Comando: node src/index.js "Termo de Busca" "Fonte"
            process = subprocess.Popen(
                ["node", script_path, termo_busca, fonte_param],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True
            )

            # Captura a saída linha por linha para exibir no Streamlit
            for line in process.stdout:
                full_log += line
                log_area.code(full_log) # Mostra o log formatado como código para facilitar a leitura
            
            process.wait()
            
            if process.returncode == 0:
                st.success("✅ Operação concluída com sucesso! Verifique seu Pipedrive.")
                st.balloons()
            else:
                st.error("❌ Ocorreu um erro durante a execução do motor Node.js.")
                
        except Exception as e:
            st.error(f"Falha ao iniciar o processo: {str(e)}")

# Rodapé
st.divider()
st.caption("Gerador de Leads B2B v1.0.0 - GeanAIOS Squad")
