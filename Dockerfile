# Usar uma imagem oficial do Python como base
FROM python:3.10-slim

# Instalar Node.js e ferramentas necessárias
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Copiar os arquivos de dependência do Node.js
COPY package*.json ./

# Instalar dependências do Node.js
RUN npm install

# Copiar o arquivo de dependências do Python
COPY requirements.txt ./

# Instalar dependências do Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o restante do código da aplicação
COPY . .

# Expor a porta que o Streamlit usará (Railway usa a variável PORT por padrão, mas mapeamos a 8501)
EXPOSE 8501

# Comando para iniciar a aplicação Streamlit
# Configurado para rodar no endereço 0.0.0.0 (permissão de rede externa)
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
