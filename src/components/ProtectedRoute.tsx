// src/components/ProtectedRoute.tsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthProvider';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useContext(AuthContext) || {};

  // If there is no currentUser, redirect to the login page
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // If the user is logged in, render the protected content
  return <>{children}</>;
}
