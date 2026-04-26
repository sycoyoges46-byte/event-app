'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import styles from '../events/manage-events.module.css'; // Reusing table styles
import api from '@/services/api';
import { Search, User, Mail, GraduationCap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Student {
  id: string;
  register_number: string;
  full_name: string;
  department: string;
  year: number;
  email?: string;
}

export default function StudentDirectoryPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students/');
      if (res.data.status === 'success') {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.register_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className={styles.main}>
      <Navbar />
      
      <div className={styles.container}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '2rem' }}>
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>

        <header className={styles.header}>
          <div>
            <h1>Student Directory</h1>
            <p>View and manage all registered student profiles.</p>
          </div>
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
        </div>

        {loading ? (
          <div className={styles.loader}>Loading student database...</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reg. Number</th>
                  <th>Full Name</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{student.register_number}</td>
                    <td style={{ color: 'white', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={14} /> {student.full_name}
                      </div>
                    </td>
                    <td>{student.department}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <GraduationCap size={14} /> Year {student.year}
                      </div>
                    </td>
                    <td>
                      {student.email ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Mail size={14} /> {student.email}
                        </div>
                      ) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className={styles.emptyState}>No students found in the database.</div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
