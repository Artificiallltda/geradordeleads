import streamlit as st
import subprocess
import os
import json

# ── Configuração da Página ────────────────────────────────────────────────────
st.set_page_config(
    page_title="Gerador de Leads B2B - GeanAIOS",
    page_icon="🎯",
    layout="wide"
)

# ── Estilos ───────────────────────────────────────────────────────────────────
st.markdown("""
    <style>
    .stButton>button {
        width: 100%;
        border-radius: 8px;
        height: 3em;
        background-color: #007bff;
        color: white;
        font-weight: bold;
        font-size: 16px;
    }
    .stButton>button:hover { background-color: #0056b3; }
    .metric-label { font-size: 13px; color: #888; }
    </style>
""", unsafe_allow_html=True)

# ── Cabeçalho ─────────────────────────────────────────────────────────────────
st.title("🎯 Gerador de Leads B2B")
st.subheader("Módulo Supremo — Maps · LinkedIn · Apify")
st.write("Extraia, enriqueça com IA e envie leads direto para o Pipedrive em segundos.")
st.divider()

# ── Formulário de Busca ───────────────────────────────────────────────────────
with st.container():
    st.info("💡 Dica: Digite o nicho e a cidade (Ex: 'Padarias em Curitiba')")

    col_t, col_f = st.columns([2, 1])
    with col_t:
        termo_busca = st.text_input(
            "O que deseja prospectar?",
            placeholder="Ex: Clínicas de Estética em São Paulo"
        )
    with col_f:
        fonte = st.radio(
            "Origem:",
            ["Google Maps", "Apify (Profissional)", "LinkedIn"],
            index=0
        )

    botao_iniciar = st.button("🚀 Iniciar Captura de Leads")

# ── Execução do Motor Node.js ─────────────────────────────────────────────────
if botao_iniciar:
    if not termo_busca:
        st.warning("⚠️ Por favor, insira um termo de busca antes de iniciar.")
    else:
        st.divider()
        st.write(f"### ⚙️ Processando: **{termo_busca}** via {fonte}")

        # Mapeamento da fonte para o parâmetro do script
        fonte_map = {
            "Google Maps": "maps",
            "Apify (Profissional)": "apify",
            "LinkedIn": "linkedin"
        }
        fonte_param = fonte_map[fonte]

        # Barra de progresso
        progresso = st.progress(0, text="Iniciando...")

        # Área de Log
        with st.expander("📋 Log de Execução", expanded=True):
            log_area = st.empty()

        full_log = ""
        data_json = None
        script_path = os.path.join("src", "index.js")

        try:
            process = subprocess.Popen(
                ["node", script_path, termo_busca, fonte_param],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True
            )

            for line in process.stdout:
                line_stripped = line.strip()

                # Captura o JSON estruturado do resumo final
                if line_stripped.startswith("__SUMMARY_JSON__"):
                    try:
                        data_json = json.loads(line_stripped.replace("__SUMMARY_JSON__", ""))
                    except json.JSONDecodeError:
                        pass
                    continue

                full_log += line
                log_area.code(full_log, language="bash")

                # Atualiza barra de progresso com base nos passos do Maestro
                if "Passo 1/3" in line:
                    progresso.progress(20, text="🔍 Extraindo leads...")
                elif "Passo 2/3" in line:
                    progresso.progress(55, text="🧠 Enriquecendo com IA...")
                elif "Passo 3/3" in line:
                    progresso.progress(85, text="📤 Sincronizando com Pipedrive...")

            process.wait()
            progresso.progress(100, text="✅ Concluído!")

            # ── Painel de KPIs ────────────────────────────────────────────────
            if data_json:
                st.divider()
                st.subheader("📊 Resultados da Operação")

                c1, c2, c3, c4, c5 = st.columns(5)
                c1.metric("🔍 Extraídos",    data_json.get("extraidos", 0))
                c2.metric("🧠 Enriquecidos", data_json.get("enriquecidos", 0))
                c3.metric("✅ CRM Criados",  data_json.get("crm_criados", 0))
                c4.metric("⏭️ Ignorados",    data_json.get("crm_ignorados", 0))
                c5.metric("❌ Erros",         data_json.get("crm_erros", 0),
                          delta_color="inverse" if data_json.get("crm_erros", 0) > 0 else "normal")

                # ── Tabela de Leads ───────────────────────────────────────────
                leads = data_json.get("leads", [])
                if leads:
                    st.divider()
                    st.subheader(f"📋 Leads Capturados ({len(leads)})")
                    # Seleciona só as colunas relevantes para exibição
                    display_cols = ["nome", "telefone", "email", "site", "rating", "endereco", "origem"]
                    leads_display = [
                        {k: v for k, v in lead.items() if k in display_cols}
                        for lead in leads
                    ]
                    st.dataframe(leads_display, use_container_width=True)

            if process.returncode == 0:
                st.success("✅ Operação concluída com sucesso! Verifique seu Pipedrive.")
                st.balloons()
            else:
                st.error("❌ Ocorreu um erro durante a execução. Veja o log acima para detalhes.")

        except FileNotFoundError:
            st.error("❌ Node.js não encontrado. Certifique-se que o Node.js está instalado e no PATH.")
        except Exception as e:
            st.error(f"❌ Falha ao iniciar o processo: {str(e)}")

# ── Rodapé ────────────────────────────────────────────────────────────────────
st.divider()
st.caption("Gerador de Leads B2B v2.0.0 - GeanAIOS Squad | Maps · Apify · LinkedIn · Pipedrive")
