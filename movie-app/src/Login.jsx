// components/Login.jsx
import React, { useState } from 'react';

const Login = ({ onLoginSuccess }) => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // login succesfull as long as fields aren't empty
    if (user && password) {
      onLoginSuccess();
    } else {
      alert('Please enter your username and password');
    }
  };

  return (
    <div className="login-container text-white flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gradient">Sign in and discover what to watch next!</h2>
        
        <div className="mb-4">
          <label className="block font-medium mb-1">Username</label>
          <input 
            type="username" 
            value={user} 
            onChange={(e) => setUser(e.target.value)}
            className="w-full p-2 text-gray-400 rounded bg-gray-800"
            placeholder="Username"
          />
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-1">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 text-gray-400 rounded bg-gray-800"
            placeholder="Password"
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200">
          Sign in
        </button>
      </form>
    </div>
  );
};

export default Login;