'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import styles from './register.module.css';
import api from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, ArrowRight, UserCheck, ArrowLeft, GraduationCap, User, MapPin } from 'lucide-react';

function RegisterContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event');

  const [step, setStep] = useState(1);
  const [registerNumber, setRegisterNumber] = useState('');
  const [studentData, setStudentData] = useState<any>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // New student fields
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [year, setYear] = useState(1);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = `/login?redirect=/register?event=${eventId}`;
        return;
      }

      if (eventId) {
        fetchEventDetails();
      }

      try {
        const userRes = await api.get('/auth/me');
        if (userRes.data.status === 'success') {
          const user = userRes.data.data;
          
          // Pre-fill fields from the user account regardless
          if (user.full_name) setFullName(user.full_name);
          if (user.email) setEmail(user.email);
          
          if (user.register_number) {
            setRegisterNumber(user.register_number);
            setStudentData({
              id: user.id, // Ensure we have the ID for the student record
              register_number: user.register_number,
              full_name: user.full_name,
              department: user.department,
              year: user.year
            });
            setStep(3); // Go straight to confirmation
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      }
    };

    checkAuthAndFetchData();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const res = await api.get(`/events/${eventId}`);
      if (res.data.status === 'success') {
        setEventData(res.data.data);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError('Event not found');
    }
  };

  const handleCheckStudent = async () => {
    if (!registerNumber) return;
    setLoading(true);
    setError('');
    
    // Cleanup old data before checking new one
    setStudentData(null);
    setFullName('');
    
    console.log(`DEBUG: Checking identity for Reg No: ${registerNumber}`);
    
    try {
      const res = await api.get(`/students/${registerNumber}`);
      if (res.data.status === 'success') {
        console.log(`DEBUG: Found student: ${res.data.data.full_name}`);
        setStudentData(res.data.data);
        setStep(3); // Jump to confirmation
      } else {
        console.log(`DEBUG: Student not found, moving to profile creation.`);
        setStep(2); // Collect details
      }
    } catch (err: any) {
      console.log(`DEBUG: Error or 404, moving to profile creation.`);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async () => {
    if (!fullName?.trim() || !email?.trim()) {
      setError('Please fill in all mandatory fields: Name and Email Address.');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        register_number: registerNumber,
        full_name: fullName.trim(),
        department,
        year: Number(year),
        email: email.trim()
      };

      console.log('DEBUG: Sending profile payload:', payload);

      const res = studentData && studentData.id
        ? await api.put(`/students/${registerNumber}`, payload)
        : await api.post('/students', payload);

      if (res.data.status === 'success') {
        setStudentData(res.data.data);
        setStep(3);
      } else {
        setError(res.data.message || 'Server returned an error');
      }
    } catch (err: any) {
      console.error('Profile Creation Error:', err);
      const detail = err.response?.data?.detail;
      const message = Array.isArray(detail) 
        ? detail.map((d: any) => `${d.loc.join('.')}: ${d.msg}`).join(', ')
        : detail || err.response?.data?.message || 'Failed to connect to server';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/registrations', {
        event_id: eventId,
        register_number: registerNumber
      });
      if (res.data.status === 'success') {
        setSuccess(true);
      } else {
        setError(res.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (!eventId) {
    return (
      <div className={styles.errorState}>
        <AlertCircle size={48} color="var(--accent)" />
        <h2>No Event Selected</h2>
        <p>Please select an event from the listings page to register.</p>
      </div>
    );
  }

  return (
    <div className={styles.cardWrapper}>
      <Link href="/events" className={styles.backLink} style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
        <ArrowLeft size={18} /> Back to Events
      </Link>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card"
      >
        <div className={styles.container}>
          {success ? (
            <div className={styles.success}>
              <CheckCircle2 size={64} color="var(--secondary)" />
              <h2>Registration Successful!</h2>
              <p>You have been successfully registered for <strong>{eventData?.name}</strong>.</p>
              <button className="btn-primary" onClick={() => window.location.href = '/events'}>
                Back to Events
              </button>
            </div>
          ) : (
            <>
              <header className={styles.formHeader}>
                <h2>Event Registration</h2>
                <p>{eventData?.name}</p>
              </header>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={styles.step}
                  >
                    <label htmlFor="reg-number">Enter Register Number</label>
                    <div className={styles.inputGroup}>
                      <input 
                        id="reg-number"
                        name="register_number"
                        type="text" 
                        placeholder="e.g. 21CS001" 
                        value={registerNumber}
                        onChange={(e) => setRegisterNumber(e.target.value.toUpperCase())}
                      />
                      <button 
                        className="btn-primary" 
                        onClick={handleCheckStudent}
                        disabled={loading || !registerNumber}
                      >
                        {loading ? 'Checking...' : 'Next'}
                      </button>
                    </div>
                    {error && <p className={styles.errorMsg}>{error}</p>}
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={styles.step}
                  >
                    <h3>Complete Your Profile</h3>
                    <p className={styles.info}>We couldn't find your details. Please provide them to continue.</p>
                    
                    <div className={styles.formGrid}>
                      <div className={styles.field}>
                        <label htmlFor="full-name">Full Name</label>
                        <input id="full-name" name="full_name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="dept">Department</label>
                        <select id="dept" name="department" value={department} onChange={(e) => setDepartment(e.target.value)}>
                          {['CSE', 'ECE', 'IT', 'MECH', 'CIVIL', 'EEE'].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="year">Year</label>
                        <select id="year" name="year" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                          {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="email-addr">Email Address</label>
                        <input id="email-addr" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@college.edu" />
                      </div>
                    </div>
                    
                    <button className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={handleCreateStudent} disabled={loading || !fullName}>
                      {loading ? 'Saving...' : 'Create Profile & Continue'}
                    </button>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={styles.step}
                  >
                    <div className={styles.confirmation}>
                      <UserCheck size={32} color="var(--primary)" />
                      <div>
                        <h3>Welcome, {studentData?.full_name}</h3>
                        <p>
                          {studentData?.department} - Year {studentData?.year}
                          <button 
                            className={styles.smallLink} 
                            onClick={() => {
                              setFullName(studentData.full_name);
                              setDepartment(studentData.department);
                              setYear(studentData.year);
                              setEmail(studentData.email || '');
                              setStep(2);
                            }}
                            style={{ marginLeft: '1rem', background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            Update Year?
                          </button>
                        </p>
                      </div>
                    </div>
                    
                    <div className={styles.infoBox}>
                      <p>Registering for: <strong>{eventData?.name}</strong></p>
                      <p>Venue: {eventData?.venue}</p>
                    </div>

                    {error && <p className={styles.errorMsg}>{error}</p>}
                    
                    <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleRegister} disabled={loading}>
                      {loading ? 'Registering...' : 'Confirm Registration'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className={styles.main}>
      <Navbar />
      <Suspense fallback={<div>Loading...</div>}>
        <RegisterContent />
      </Suspense>
    </main>
  );
}
