// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotePage from './pages/NotePage';
import HomePage from './pages/HomePage';
import PasswordPage from './pages/ResetPage';
import EmailPage from './pages/VerifyPage';
import EditProfilePage from './pages/EditProfilePage';
import PrivateRoute from './components/PrivateRoute'; 

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<PasswordPage />} />
        <Route path="/verify-email" element={<EmailPage />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-note/:id"
          element={
            <PrivateRoute>
              <NotePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <PrivateRoute>
              <EditProfilePage />
            </PrivateRoute>
          }
        />
        {/* Add more protected routes here as needed */}
      </Routes>
    </Router>
  );
};

export default App;
