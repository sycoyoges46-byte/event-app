'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import styles from './events.module.css';
import api from '@/services/api';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar as CalendarIcon, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Event {
  id: string;
  name: string;
  description: string;
  department: string;
  venue: string;
  date_time: string;
  max_capacity: number;
  current_registrations: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events/');
      if (response.data.status === 'success') {
        setEvents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const departments = ['All', 'CSE', 'ECE', 'IT', 'MECH', 'CIVIL', 'EEE'];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || event.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <main className={styles.main}>
      <Navbar />
      
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={18} /> Back to Home
        </Link>
        <header className={styles.header}>
          <h1 className="heading-gradient">Upcoming Events</h1>
          <p>Discover and register for the latest college activities.</p>
        </header>

        <div className={styles.filters}>
          <div className={styles.searchBar}>
            <Search size={20} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className={styles.deptFilters}>
            {departments.map(dept => (
              <button 
                key={dept}
                className={`${styles.deptBtn} ${selectedDept === dept ? styles.active : ''}`}
                onClick={() => setSelectedDept(dept)}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.loader}>Loading events...</div>
        ) : (
          <div className={styles.grid}>
            {filteredEvents.map((event, index) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card"
              >
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <span className={styles.deptBadge}>{event.department}</span>
                    <span className={styles.capacityBadge}>
                      <Users size={14} /> {event.current_registrations}/{event.max_capacity}
                    </span>
                  </div>
                  <h3 className={styles.eventTitle}>{event.name}</h3>
                  <p className={styles.eventDesc}>{event.description}</p>
                  
                  <div className={styles.eventDetails}>
                    <div className={styles.detailItem}>
                      <CalendarIcon size={16} />
                      <span>{new Date(event.date_time).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <MapPin size={16} />
                      <span>{event.venue}</span>
                    </div>
                  </div>
                  
                  <Link href={`/register?event=${event.id}`} className={styles.registerBtn}>
                    Register Now
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
