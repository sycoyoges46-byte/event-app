'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import styles from './new-event.module.css';
import api from '@/services/api';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Award, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CreateEventPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    organizer: '',
    department: 'CSE',
    venue: '',
    date_time: '',
    max_capacity: 100,
    eligibility_dept: [] as string[],
    eligibility_year: [] as number[]
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/events', formData);
      if (res.data.status === 'success') {
        setSuccess(true);
      } else {
        setError(res.data.message);
      }
    } catch (err: any) {
      setError('Failed to create event. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const departments = ['CSE', 'ECE', 'IT', 'MECH', 'CIVIL', 'EEE'];
  const years = [1, 2, 3, 4];

  const toggleDept = (dept: string) => {
    setFormData(prev => ({
      ...prev,
      eligibility_dept: prev.eligibility_dept.includes(dept)
        ? prev.eligibility_dept.filter(d => d !== dept)
        : [...prev.eligibility_dept, dept]
    }));
  };

  const toggleYear = (year: number) => {
    setFormData(prev => ({
      ...prev,
      eligibility_year: prev.eligibility_year.includes(year)
        ? prev.eligibility_year.filter(y => y !== year)
        : [...prev.eligibility_year, year]
    }));
  };

  return (
    <main className={styles.main}>
      <Navbar />
      
      <div className={styles.container}>
        <Link href="/admin" className={styles.backLink}>
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>

        <div className={styles.wrapper}>
          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={styles.successCard}
            >
              <CheckCircle size={64} color="var(--secondary)" />
              <h2>Event Created!</h2>
              <p>Your event <strong>{formData.name}</strong> is now live and students can register.</p>
              <div className={styles.successActions}>
                <button className="btn-primary" onClick={() => window.location.href = '/events'}>View in Listings</button>
                <button className={styles.secondaryBtn} onClick={() => setSuccess(false)}>Create Another</button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card"
            >
              <form onSubmit={handleSubmit} className={styles.form}>
                <header className={styles.formHeader}>
                  <h1>Create New Event</h1>
                  <p>Define the details and eligibility for your college event.</p>
                </header>

                <div className={styles.section}>
                  <h3><Award size={18} /> Basic Information</h3>
                  <div className={styles.grid}>
                    <div className={styles.field}>
                      <label>Event Name</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Technical Workshop 2024"
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Department / Organizer</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.organizer} 
                        onChange={e => setFormData({...formData, organizer: e.target.value})}
                        placeholder="e.g. CSE Department"
                      />
                    </div>
                  </div>
                  <div className={styles.field} style={{ marginTop: '1rem' }}>
                    <label>Description</label>
                    <textarea 
                      required 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="What is this event about?"
                    />
                  </div>
                </div>

                <div className={styles.section}>
                  <h3><Calendar size={18} /> Logistics</h3>
                  <div className={styles.grid}>
                    <div className={styles.field}>
                      <label>Date & Time</label>
                      <input 
                        type="datetime-local" 
                        required 
                        value={formData.date_time} 
                        onChange={e => setFormData({...formData, date_time: e.target.value})}
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Venue</label>
                      <div className={styles.inputWithIcon}>
                        <MapPin size={16} />
                        <input 
                          type="text" 
                          required 
                          value={formData.venue} 
                          onChange={e => setFormData({...formData, venue: e.target.value})}
                          placeholder="e.g. Hall A, 3rd Floor"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.section}>
                  <h3><Users size={18} /> Capacity & Eligibility</h3>
                  <div className={styles.grid}>
                    <div className={styles.field}>
                      <label>Max Capacity</label>
                      <input 
                        type="number" 
                        required 
                        value={formData.max_capacity} 
                        onChange={e => setFormData({...formData, max_capacity: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  
                  <div className={styles.eligibility}>
                    <div className={styles.subSection}>
                      <label>Restrict to Departments (Optional)</label>
                      <div className={styles.chipGroup}>
                        {departments.map(d => (
                          <button 
                            key={d} 
                            type="button" 
                            className={`${styles.chip} ${formData.eligibility_dept.includes(d) ? styles.activeChip : ''}`}
                            onClick={() => toggleDept(d)}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className={styles.subSection}>
                      <label>Restrict to Years (Optional)</label>
                      <div className={styles.chipGroup}>
                        {years.map(y => (
                          <button 
                            key={y} 
                            type="button" 
                            className={`${styles.chip} ${formData.eligibility_year.includes(y) ? styles.activeChip : ''}`}
                            onClick={() => toggleYear(y)}
                          >
                            Year {y}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {error && <p className={styles.errorMsg}>{error}</p>}

                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '2rem' }} disabled={loading}>
                  {loading ? 'Creating Event...' : 'Publish Event'}
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
