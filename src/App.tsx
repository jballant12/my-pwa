import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './components/SignUp';
import Login from './components/Login';
import HomeScreen from './components/HomeScreen';
import Consult from './components/Consult';
import Workout from './components/Workout';
import Progress from './components/Progress';
import User from './components/User';
import Trainer from './components/Trainer';
import FitnessDashboard from './components/FitnessDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './components/AuthProvider';
import { TrainerProvider } from './context/TrainerContext';
import { UserProvider } from './context/UserContext';


function App() {
  return (
    <Router>
      <AuthProvider>
        <TrainerProvider>
          <UserProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <HomeScreen />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user" 
            element={
              <ProtectedRoute>
                <User />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trainer" 
            element={
              <ProtectedRoute>
                <Trainer />
              </ProtectedRoute>
            } 
            />
            <Route 
            path="/HomeScreen"  // Ensure path is exactly as you're navigating
            element={
              <ProtectedRoute>
                <HomeScreen />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/exercise" 
            element={
              <ProtectedRoute>
                <FitnessDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/consult" 
            element={
              <ProtectedRoute>
                <Consult />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workout" 
            element={
              <ProtectedRoute>
                <Workout />
              </ProtectedRoute>
            } 
          />
                    <Route 
            path="/progress" 
            element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            } 
          />

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
        </UserProvider>
        </TrainerProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

