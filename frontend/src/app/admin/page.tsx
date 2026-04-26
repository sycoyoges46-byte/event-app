'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import styles from './admin.module.css';
import api from '@/services/api';
import { motion } from 'framer-motion';
import { Plus, Settings, Users, Calendar, TrendingUp, PieChart } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    const token = localStorage.getItem('token');
    
    if (!token || role !== 'admin') {
      window.location.href = '/login';
      return;
    }
    
    if (activeTab === 'overview') fetchStats();
    if (activeTab === 'events') fetchEvents();
    if (activeTab === 'students') fetchStudents();
  }, [activeTab]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      if (res.data.status === 'success') {
        setStats(res.data.data);
      }
    } catch (err) {
      setError('Could not load statistics.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events/');
      if (res.data.status === 'success') {
        setEvents(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students');
      if (res.data.status === 'success') {
        setStudents(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter(e => e.id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <main className={styles.main}>
      <Navbar />
      
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className="heading-gradient">Admin Dashboard</h1>
            <p>Welcome back, system administrator.</p>
          </div>
          <div className={styles.actions}>
            <Link href="/admin/events/new" className="btn-primary">
              <Plus size={18} /> New Event
            </Link>
            <Link href="/admin/events" className={styles.actionLink}>
              <Calendar size={18} /> Manage Events
            </Link>
            <Link href="/admin/students" className={styles.actionLink}>
              <Users size={18} /> Student Database
            </Link>
          </div>
        </header>

        <div className={styles.tabs}>
          <button 
            className={activeTab === 'overview' ? styles.activeTab : ''} 
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'events' ? styles.activeTab : ''} 
            onClick={() => setActiveTab('events')}
          >
            Manage Events
          </button>
          <button 
            className={activeTab === 'students' ? styles.activeTab : ''} 
            onClick={() => setActiveTab('students')}
          >
            Student Directory
          </button>
        </div>

        {loading ? (
          <div className={styles.loader}>Loading statistics...</div>
        ) : (
          <div className={styles.content}>
            {activeTab === 'overview' && (
              <div className={styles.overview}>
                <div className={styles.statGrid}>
                  <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div className={styles.statHeader}>
                      <Users size={20} color="var(--primary)" />
                      <span>Total Students</span>
                    </div>
                    <h2 className={styles.statValue}>{stats?.summary?.total_students || 0}</h2>
                  </div>
                  <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div className={styles.statHeader}>
                      <Calendar size={20} color="var(--secondary)" />
                      <span>Active Events</span>
                    </div>
                    <h2 className={styles.statValue}>{stats?.summary?.total_events || 0}</h2>
                  </div>
                  <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div className={styles.statHeader}>
                      <TrendingUp size={20} color="var(--accent)" />
                      <span>Total Registrations</span>
                    </div>
                    <h2 className={styles.statValue}>{stats?.summary?.total_registrations || 0}</h2>
                  </div>
                  <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div className={styles.statHeader}>
                      <PieChart size={20} color="#fbbf24" />
                      <span>Confirmed Rate</span>
                    </div>
                    <h2 className={styles.statValue}>
                      {stats?.summary?.total_registrations > 0 
                        ? Math.round((stats.summary.confirmed_registrations / stats.summary.total_registrations) * 100) 
                        : 0}%
                    </h2>
                  </div>
                </div>

                <div className={styles.bottomGrid}>
                  <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3>Department Distribution</h3>
                    <div className={styles.chartPlaceholder}>
                      {Object.entries(stats?.department_distribution || {}).map(([dept, count]: any) => (
                        <div key={dept} className={styles.barItem}>
                          <div className={styles.barLabel}>{dept}</div>
                          <div className={styles.barWrapper}>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(count / stats.summary.total_students) * 100}%` }}
                              className={styles.bar}
                              style={{ background: 'var(--primary)' }}
                            />
                          </div>
                          <div className={styles.barCount}>{count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'events' && (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Event Name</th>
                      <th>Dept</th>
                      <th>Reg. Count</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(event => (
                      <tr key={event.id}>
                        <td>{event.name}</td>
                        <td>{event.department}</td>
                        <td>{event.current_registrations} / {event.max_capacity}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link href={`/admin/registrations/${event.id}`} title="View Registrations">
                              <TrendingUp size={18} color="var(--secondary)" />
                            </Link>
                            <button onClick={() => handleDeleteEvent(event.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                              <Settings size={18} color="var(--accent)" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'students' && (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Reg No.</th>
                      <th>Dept</th>
                      <th>Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td>{student.full_name}</td>
                        <td>{student.register_number}</td>
                        <td>{student.department}</td>
                        <td>{student.year}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
