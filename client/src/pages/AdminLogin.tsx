import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock } from 'react-icons/fi';
import { useAuth } from "../context/AuthContext";



const AdminLogin: React.FC= () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // ✅ Bunu ekle
    console.log("Gönderilen:", {
      identifier: username,
      password: password
    });
  
    try {
      const response = await fetch("http://localhost:5000/api/auth/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          identifier: username,
          password: password
        })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Giriş başarısız");
      }
  
      login(data.token);
      navigate("/admin");
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl px-10 py-12 w-full max-w-md flex flex-col items-center border border-blue-100"
      >
        <h2 className="text-3xl font-bold mb-2 text-blue-700">Admin Girişi</h2>
        <p className="mb-8 text-gray-500">Hoş geldiniz! Lütfen giriş yapın.</p>
        {error && (
          <div className="w-full mb-6 flex items-center justify-center">
            <span className="bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow animate-shake border border-red-300 font-semibold">
              {error}
            </span>
          </div>
        )}
        <div className="w-full mb-5 relative">
          <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-xl" />
          <input
            type="text"
            placeholder="Kullanıcı Adı"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full pl-10 pr-3 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            autoFocus
          />
        </div>
        <div className="w-full mb-8 relative">
          <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-xl" />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full pl-10 pr-3 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-lg font-semibold text-lg shadow hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition-all duration-200"
        >
          Giriş Yap
        </button>
      </form>
      <button
        onClick={() => navigate("/")}
        className="mt-6 ml-4 px-6 py-2 bg-white/80 border border-blue-300 text-blue-700 rounded-lg shadow hover:bg-blue-50 transition-all duration-200 font-semibold"
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        ← Ana Sayfaya Dön
      </button>
      <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
          100% { transform: translateX(0); }
        }
        .animate-shake {
          animation: shake 0.4s;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin; 