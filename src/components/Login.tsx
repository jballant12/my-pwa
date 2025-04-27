import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      // Log in the user
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in successfully");

      // Navigate to the home screen after successful login
      navigate('/homescreen');
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error signing in: ", err.message);
        setError(err.message);  // Display error message
      } else {
        console.error("Unexpected error", err);
      }
    }
  };
    

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <form onSubmit={handleLogin} className="p-6 bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl text-white">
        <h1 className="text-2xl mb-4">Login</h1>
        {error && <p className="text-red-600">{error}</p>}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded w-full py-2 px-3"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded w-full py-2 px-3"
            required
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">
          Login
        </button>
                {/* Link to the Sign-Up Page */}
        <p className="mt-4">
          Don't have an account? <Link to="/signup" className="text-blue-600">Sign up here</Link>
        </p>
      </form>
    </div>
  );
}
