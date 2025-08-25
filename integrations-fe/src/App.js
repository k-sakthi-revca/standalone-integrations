import './App.css';
import ApiTester from './components/ApiTester';
import { Routes, Route, Link, BrowserRouter as Router, Navigate } from 'react-router-dom';
import OneLogin from './components/OneLogin';
function App() {
  return (
    <Router>
    <div className="App">
      <header className="App-header">
        <h1>Integrations</h1>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<OneLogin />} />
          <Route path="/home" element={<ApiTester />} />
        </Routes>
      </main>
    </div>
    </Router>
  );
}

export default App;
