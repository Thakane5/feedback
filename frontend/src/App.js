import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import FeedbackForm from './components/FeedbackForm';
import FeedbackList from './components/FeedbackList';
import './App.css';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFeedbackAdded = () => {
    // Trigger refresh of feedback list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="nav-logo"> Student Feedback System</h1>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link to="/submit" className="nav-link">Submit Feedback</Link>
              </li>
              <li className="nav-item">
                <Link to="/view" className="nav-link">View Feedback</Link>
              </li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route 
              path="/submit" 
              element={<FeedbackForm onFeedbackAdded={handleFeedbackAdded} />} 
            />
            <Route 
              path="/view" 
              element={<FeedbackList refreshTrigger={refreshTrigger} />} 
            />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2024 Student Feedback System | LUCT</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;