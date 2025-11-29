import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PLPage from './pages/PLPage';
import BSPage from './pages/BSPage';
import CFPage from './pages/CFPage';
import NotesPage from './pages/NotesPage';

function App() {
  return (
    <BrowserRouter basename="/FinSight">
      <div className="min-h-screen bg-bg-dark text-text-primary">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pl" element={<PLPage />} />
          <Route path="/bs" element={<BSPage />} />
          <Route path="/cf" element={<CFPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
