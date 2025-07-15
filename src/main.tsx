import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import EnhancedDancerPortfolio from './components/EnhancedDancerPortfolio.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/portfolio/:nickname" element={<EnhancedDancerPortfolio />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
