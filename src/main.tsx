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
        <Route path="/home" element={<App />} />
        <Route path="/ranking" element={<App />} />
        <Route path="/competitions" element={<App />} />
        <Route path="/crews" element={<App />} />
        <Route path="/profile" element={<App />} />
        <Route path="/admin" element={<App />} />
        <Route path="/portfolio/:nickname" element={<EnhancedDancerPortfolio />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
