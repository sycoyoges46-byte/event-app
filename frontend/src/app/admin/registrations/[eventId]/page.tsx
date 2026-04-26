'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import styles from './registrations.module.css';
import api from '@/services/api';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Download, Search, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Registration {
  id: string;
  register_number: string;
  student_name: string;
  department: string;
  year: number;
  status: string;
  registration_date: string;
}

export default function EventRegistrationsPage() {
  const { eventId } = useParams();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      const [regRes, eventRes] = await Promise.all([
        api.get(`/registrations/event/${eventId}`),
        api.get(`/events/${eventId}`)
      ]);
      
      if (regRes.data.status === 'success') {
        setRegistrations(regRes.data.data);
      }
      if (eventRes.data.status === 'success') {
        setEventName(eventRes.data.data.name);
      }
    } catch (err) {
      console.error('Failed to fetch registration data');
    } finally {
      setLoading(false);
    }
  };

  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  const filteredRegistrations = registrations.filter(r => {
    const matchesSearch = r.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.register_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || r.department === selectedDept;
    const matchesYear = selectedYear === 'All' || r.year === Number(selectedYear);
    return matchesSearch && matchesDept && matchesYear;
  });

  const depts = ['All', 'CSE', 'ECE', 'IT', 'MECH', 'CIVIL', 'EEE'];
  const years = ['All', '1', '2', '3', '4'];

  const exportCSV = () => {
    const headers = ['Register Number,Name,Department,Year,Status,Date\n'];
    const rows = filteredRegistrations.map(r => 
      `${r.register_number},${r.student_name},${r.department},${r.year},${r.status},${new Date(r.registration_date).toLocaleString()}`
    );
    const blob = new Blob([headers + rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventName}_registrations.csv`;
    a.click();
  };

  return (
    <main className={styles.main}>
      <Navbar />
      
      <div className={styles.container}>
        <Link href="/admin/events" className={styles.backLink}>
          <ArrowLeft size={18} /> Back to Events
        </Link>

        <header className={styles.header}>
          <div>
            <h1>{eventName || 'Loading...'}</h1>
            <p>Registration list and attendance tracking.</p>
          </div>
          <button className={styles.exportBtn} onClick={exportCSV}>
            <Download size={18} /> Export CSV
          </button>
        </header>

        <div className={styles.controls}>
          <div className={styles.searchBar}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by name or register number..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className={styles.filters}>
            <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
              {depts.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
            </select>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
              {years.map(y => <option key={y} value={y}>{y === 'All' ? 'All Years' : `Year ${y}`}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className={styles.loader}>Loading registrations...</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reg. Number</th>
                  <th>Student Name</th>
                  <th>Dept & Year</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map(reg => (
                  <tr key={reg.id}>
                    <td className={styles.regNo}>{reg.register_number}</td>
                    <td className={styles.nameCell}>
                      <User size={14} /> {reg.student_name}
                    </td>
                    <td>{reg.department} - Year {reg.year}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${reg.status === 'confirmed' ? styles.confirmed : styles.waitlisted}`}>
                        {reg.status === 'confirmed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {reg.status}
                      </span>
                    </td>
                    <td>{new Date(reg.registration_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRegistrations.length === 0 && (
              <div className={styles.emptyState}>No registrations found.</div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
