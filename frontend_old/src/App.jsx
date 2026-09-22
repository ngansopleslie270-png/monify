import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import './styles/index.css';

/**
 * App.jsx – Configuration du routeur Monify
 *
 * Routes actuellement disponibles (Phase 0) :
 *   /      → HomePage (page d'accueil branding)
 *
 * Routes à venir :
 *   /login       → LoginPage     (Phase 1)
 *   /register    → RegisterPage  (Phase 1)
 *   /dashboard   → DashboardPage (Phase 3)
 *   /ventes      → VentesPage    (Phase 2)
 *   /depenses    → DepensesPage  (Phase 2)
 *   /historique  → HistoriquePage(Phase 2)
 *   /categories  → CategoriesPage(Phase 2)
 */
function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Phase 1 – Authentification */}
          {/* <Route path="/login"    element={<LoginPage />} /> */}
          {/* <Route path="/register" element={<RegisterPage />} /> */}
          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
