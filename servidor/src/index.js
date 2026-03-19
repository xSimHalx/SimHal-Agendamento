const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORTA = process.env.PORTA || 3001;

// Configuração de CORS - Previne erro de CORS mostrado na imagem anterior
app.use(cors({
  origin: 'http://localhost:3000', // Porta padrão do nosso Vite
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Importar Rotas
const autenticacaoRotas = require('./rotas/autenticacaoRotas');
const negocioRotas = require('./rotas/negocioRotas');
const clienteRotas = require('./rotas/clienteRotas');
const dashboardRotas = require('./rotas/dashboardRotas');

// Usar Rotas
app.use('/api/autenticacao', autenticacaoRotas);
app.use('/api/negocio', negocioRotas);
app.use('/api/clientes', clienteRotas);
app.use('/api/dashboard', dashboardRotas);

// Rota de teste
app.get('/', (req, res) => {
  res.send('Servidor SimHal-Agendamento Funcionando!');
});

app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`); // Local DB port sync (5432)
});
