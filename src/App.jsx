// src/App.jsx
import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { useState, useEffect } from 'react';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md mb-8">
        <h1 className="text-2xl font-bold text-gray-800">FIUU App</h1>
        <nav className="space-x-4">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="text-blue-500 hover:text-blue-700 font-medium">Login</Link>
              <Link to="/register" className="text-blue-500 hover:text-blue-700 font-medium">Register</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="text-blue-500 hover:text-blue-700 font-medium">Dashboard</Link>
              <button onClick={handleLogout} className="text-red-500 hover:text-red-700 font-medium">Logout</button>
            </>
          )}
        </nav>
      </header>
      <Routes>
        <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
        <Route path="/register" element={<Register />} />
        <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;