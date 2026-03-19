import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './paginas/Login';
import AgendamentoCliente from './paginas/AgendamentoCliente';
import PainelAdmin from './paginas/PainelAdmin';
import PaginaInicial from './paginas/PaginaInicial';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PaginaInicial />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<PainelAdmin />} />
        <Route path="/:slug" element={<AgendamentoCliente />} />
      </Routes>
    </Router>
  );
}

export default App;
