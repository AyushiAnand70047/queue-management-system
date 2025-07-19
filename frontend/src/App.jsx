import 'bootstrap/dist/css/bootstrap.min.css';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// Importing page components
import Auth from './pages/Login';
import ManagerDashboard from './pages/ManagerDashboad';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route: login/register page */}
        <Route path="/" element={<Auth />} />

        {/* Manager dashboard */}
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />

      </Routes>
    </Router>
  );
}

export default App;