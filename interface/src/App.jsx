import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './paginas/Login';
import AgendamentoCliente from './paginas/AgendamentoCliente';
import PainelAdmin from './paginas/PainelAdmin';
import NavegacaoDebug from './componentes/NavegacaoDebug';

function App() {
  return (
    <Router>
      <NavegacaoDebug />
      <Routes>
        <Route path="/:slug" element={<AgendamentoCliente />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<PainelAdmin />} />
        {/* Fallback para redirecionar para a barbearia padrão de testes se acessar a raiz sem slug */}
        <Route path="/" element={<AgendamentoCliente />} /> 
      </Routes>
    </Router>
  );
}

export default App;
