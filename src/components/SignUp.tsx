import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';  // Import Firestore database
import { Link, useNavigate } from 'react-router-dom';


export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const auth = getAuth();  // Ensure auth is defined here

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save additional user info to Firestore (e.g., username)
      await setDoc(doc(db, 'Users', user.uid), {
        email,
        username
      });

    console.log("User signed up successfully");
    navigate('/login', { state: { message: 'Account created successfully. Please log in.' } });
    } catch (err) {
        if (err instanceof Error) {
          console.error("Error signing up: ", err.message);
          setError(err.message);  // Display error message
        }
      }
    };    

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSignUp} className="p-6 bg-white rounded shadow-md">
        <h1 className="text-2xl mb-4">Sign Up</h1>
        {error && <p className="text-red-600">{error}</p>}
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border rounded w-full py-2 px-3"
            required
          />
        </div>
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
          Sign Up
        </button>
        {/* Link to the Login Page */}
        <p className="mt-4">
          Already have an account? <Link to="/login" className="text-blue-600">Login here</Link>
        </p>
      </form>
    </div>
  );
}
