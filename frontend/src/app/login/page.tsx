'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import styles from './login.module.css';
import api from '@/services/api';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const res = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.status === 'success') {
        const { access_token, role } = res.data.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user_role', role);
        
        if (role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(res.data.message);
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <Navbar />
      
      <div className={styles.cardWrapper}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={18} /> Back to Home
        </Link>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          <div className={styles.container}>
            <header className={styles.header}>
              <div className={styles.iconCircle}>
                <Lock size={24} color="var(--primary)" />
              </div>
              <h1>Student & Staff Login</h1>
              <p>Access your personalized dashboard</p>
            </header>

            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="email"><Mail size={16} /> Email Address</label>
                <input 
                  id="email"
                  name="email"
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="name@college.edu"
                />
              </div>
              
              <div className={styles.field}>
                <label htmlFor="password"><Lock size={16} /> Password</label>
                <div className={styles.passwordWrapper}>
                  <input 
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    className={styles.toggleBtn}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className={styles.errorBox}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
