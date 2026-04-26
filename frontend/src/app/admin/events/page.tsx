'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import styles from './manage-events.module.css';
import api from '@/services/api';
import { motion } from 'framer-motion';
import { Edit, Trash2, Eye, Plus, Search, Calendar, MapPin, Users } from 'lucide-react';
import Link from 'next/link';

interface Event {
  id: string;
  name: string;
  department: string;
  venue: string;
  date_time: string;
  max_capacity: number;
  current_registrations: number;
}

export default function ManageEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events/');
      if (res.data.status === 'success') {
        setEvents(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    
    try {
      const res = await api.delete(`/events/${id}`);
      if (res.data.status === 'success') {
        setEvents(events.filter(e => e.id !== id));
      }
    } catch (err) {
      alert('Failed to delete event');
    }
  };

  const filteredEvents = events.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className={styles.main}>
      <Navbar />
      
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1>Manage Events</h1>
            <p>Monitor, edit, or remove college events.</p>
          </div>
          <Link href="/admin/events/new" className="btn-primary">
            <Plus size={18} /> Create Event
          </Link>
        </header>

        <div className={styles.controls}>
          <div className={styles.searchBar}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by name or department..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className={styles.loader}>Loading events...</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Department</th>
                  <th>Date & Time</th>
                  <th>Venue</th>
                  <th>Reg. Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map(event => (
                  <tr key={event.id}>
                    <td className={styles.nameCell}>{event.name}</td>
                    <td><span className={styles.deptBadge}>{event.department}</span></td>
                    <td className={styles.dateCell}>
                      <Calendar size={14} /> {new Date(event.date_time).toLocaleDateString()}
                    </td>
                    <td>{event.venue}</td>
                    <td>
                      <div className={styles.capacityRow}>
                        <Users size={14} /> {event.current_registrations} / {event.max_capacity}
                      </div>
                    </td>
                    <td className={styles.actions}>
                      <Link href={`/admin/registrations/${event.id}`} title="View Registrations">
                        <Eye size={18} color="var(--secondary)" />
                      </Link>
                      <button onClick={() => handleDelete(event.id)} title="Delete Event">
                        <Trash2 size={18} color="var(--accent)" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredEvents.length === 0 && (
              <div className={styles.emptyState}>No events found.</div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
