'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Mail, GraduationCap, MapPin, CheckCircle2, ArrowRight, ArrowLeft, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Navbar from '@/components/Navbar';
import styles from './signup.module.css';
import api from '@/services/api';

export default function StudentSignupPage() {
  const [registerNumber, setRegisterNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [year, setYear] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Clear session when entering signup to prevent overlap
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/students', {
        register_number: registerNumber.toUpperCase(),
        full_name: fullName,
        department,
        year,
        email,
        password
      });

      if (res.data.status === 'success') {
        setSuccess(true);
      } else {
        setError(res.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed. Register number might already exist.');
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
            {success ? (
              <div className={styles.successState}>
                <div className={styles.successIcon}>
                  <CheckCircle2 size={48} color="var(--secondary)" />
                </div>
                <h2>Profile Created!</h2>
                <p>Welcome to the platform, <strong>{fullName}</strong>. Your student profile is now active.</p>
                
                <div className={styles.successActions}>
                  <Link href={`/dashboard?reg=${registerNumber}`} className="btn-primary">
                    Go to My Events <ArrowRight size={18} />
                  </Link>
                  <Link href="/events" className={styles.secondaryLink}>
                    Browse Upcoming Events
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <header className={styles.header}>
                  <div className={styles.iconCircle}>
                    <Shield size={30} color="var(--primary)" />
                  </div>
                  <h1 className="heading-gradient">Student Signup</h1>
                  <p>Join the College Event Management System</p>
                </header>

                <form onSubmit={handleSignup} className={styles.form}>
                  <div className={styles.grid}>
                    <div className={styles.field}>
                      <label><User size={16} /> Register Number</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. 24CS054"
                        value={registerNumber}
                        onChange={(e) => setRegisterNumber(e.target.value)}
                      />
                    </div>

                    <div className={styles.field}>
                      <label><User size={16} /> Full Name</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>

                    <div className={styles.field}>
                      <label><MapPin size={16} /> Department</label>
                      <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                        {['CSE', 'ECE', 'IT', 'MECH', 'CIVIL', 'EEE'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.field}>
                      <label><GraduationCap size={16} /> Year</label>
                      <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                        {[1, 2, 3, 4].map(y => (
                          <option key={y} value={y}>Year {y}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.field}>
                      <label><Mail size={16} /> Email Address</label>
                      <input 
                        type="email" 
                        required
                        placeholder="your.email@college.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className={styles.field}>
                      <label><Shield size={16} /> Create Password</label>
                      <div className={styles.passwordWrapper}>
                        <input 
                          type={showPassword ? "text" : "password"} 
                          required
                          placeholder="Min. 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
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
                  </div>

                  {error && (
                    <div className={styles.errorBox}>
                      <AlertCircle size={18} />
                      <span>{error}</span>
                    </div>
                  )}

                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Creating Profile...' : 'Create Student Profile'}
                  </button>

                  <div className={styles.footer}>
                    <p>Already have a profile? <Link href="/dashboard">Check My Events</Link></p>
                    <p className={styles.adminNote}>Admin or Staff? <Link href="/login">Login here</Link></p>
                  </div>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
