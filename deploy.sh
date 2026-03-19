#!/bin/bash

# =================================================================
# 🚀 SimHal SASS - Script de Deploy Automático (VPS)
# =================================================================

echo "🚀 Iniciando deploy do SimHal..."

# 1. Puxar as últimas alterações do Git
echo "📥 Puxando código do GitHub..."
git pull origin main

# 2. Configurar o Backend (Servidor)
echo "⚙️  Configurando Backend..."
cd servidor
npm install
npx prisma generate
# npx prisma migrate deploy # Descomente se quiser migrar o DB automaticamente
cd ..

# 3. Configurar o Frontend (Interface)
echo "🖥️  Configurando Frontend..."
cd interface
npm install
npm run build 
cd ..

# 4. Reiniciar o Sistema no PM2
echo "🔄 Reiniciando serviços..."
# Nota: Ajuste os nomes "--name" se você mudou na primeira vez
pm2 restart simhal-backend || pm2 start servidor/src/index.js --name simhal-backend
# Se estiver servindo o front via PM2 (opcional):
# pm2 restart simhal-frontend || pm2 start "npm run start" --name simhal-frontend --cwd ./interface

echo "✅ Deploy concluído com sucesso!"
pm2 list
