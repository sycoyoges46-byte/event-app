'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import styles from './dashboard.module.css';
import api from '@/services/api';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock, AlertCircle, Search, User, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Registration {
  id: string;
  event_name: string;
  register_number: string;
  status: string;
  registration_date: string;
}

export default function StudentDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [regNumber, setRegNumber] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndRegistrations = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const userRes = await api.get('/auth/me');
        if (userRes.data.status === 'success') {
          const user = userRes.data.data;
          if (user.register_number) {
            setRegNumber(user.register_number);
            fetchRegistrations(user.register_number);
          } else {
            setLoading(false);
          }
        } else {
          localStorage.removeItem('token');
          router.push('/login');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setLoading(false);
        setError('Please log in to view your registrations.');
        // Don't auto-redirect on network error, show error message instead
      }
    };

    fetchUserAndRegistrations();
  }, [router]);

  const fetchRegistrations = async (num: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/registrations/student/${num}`);
      if (res.data.status === 'success') {
        setRegistrations(res.data.data);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError('Failed to fetch registrations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <Navbar />
      
      <div className={styles.container}>
        <Link href="/" className={styles.backLink} style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
          <ArrowLeft size={18} /> Back to Home
        </Link>
        <header className={styles.header}>
          <h1 className="heading-gradient">My Events</h1>
          <p>Track your registration status and upcoming college activities.</p>
        </header>

        {loading ? (
          <div className={styles.loader}>Fetching your details...</div>
        ) : error ? (
          <div className={styles.errorBox}>
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        ) : registrations.length > 0 ? (
          <div className={styles.grid}>
            {registrations.map((reg, index) => (
              <motion.div 
                key={reg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card"
              >
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <div className={`${styles.statusBadge} ${reg.status === 'confirmed' ? styles.confirmed : styles.waitlisted}`}>
                      {reg.status === 'confirmed' ? <CheckCircle size={14} /> : <Clock size={14} />}
                      {reg.status}
                    </div>
                    <span className={styles.dateText}>
                      {new Date(reg.registration_date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className={styles.eventName}>{reg.event_name}</h3>
                  
                  <div className={styles.details}>
                    <div className={styles.detailItem}>
                      <User size={14} />
                      <span>Reg No: {reg.register_number}</span>
                    </div>
                  </div>

                  {reg.status === 'waitlisted' && (
                    <div className={styles.waitlistInfo}>
                      <AlertCircle size={14} />
                      <span>You will be confirmed if a spot opens up.</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : regNumber && (
          <div className={styles.emptyState}>
            <Calendar size={48} color="#64748b" />
            <h3>No registrations found</h3>
            <p>You haven't registered for any events yet with this number.</p>
            <Link href="/events" className="btn-primary" style={{ marginTop: '1.5rem' }}>Browse Events</Link>
          </div>
        )}
      </div>
    </main>
  );
}
