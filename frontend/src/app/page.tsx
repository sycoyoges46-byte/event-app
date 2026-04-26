'use client';

import Navbar from '@/components/Navbar';
import styles from './page.module.css';
import { motion } from 'framer-motion';
import { Calendar, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className={styles.main}>
      <Navbar />
      
      <section className={styles.hero}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={styles.heroContent}
        >
          <span className={styles.badge}>Next-Gen Event Management</span>
          <h1 className={styles.title}>
            Elevate Your <span className="heading-gradient">College Experience</span>
          </h1>
          <p className={styles.subtitle}>
            The all-in-one platform for managing internal department events, workshops, and technical fests with ease.
          </p>
          
          <div className={styles.ctaGroup}>
            <Link href="/events" className="btn-primary">
              Browse Events <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </Link>
            <Link href="/login" className={styles.secondaryBtn}>
              Staff Portal
            </Link>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={styles.heroImage}
        >
          <div className="glass-card" style={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div className={styles.statsCard}>
                <Calendar size={48} color="var(--primary)" />
                <div style={{ marginTop: '1rem' }}>
                  <h3 style={{ fontSize: '2rem' }}>50+</h3>
                  <p style={{ color: '#94a3b8' }}>Upcoming Events</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className={styles.features}>
        <div className={styles.featureGrid}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <Users size={32} color="var(--secondary)" />
            <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Student Centric</h3>
            <p style={{ color: '#94a3b8' }}>Register with just your register number. No complex accounts needed for students.</p>
          </div>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <Calendar size={32} color="var(--primary)" />
            <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Smart Scheduling</h3>
            <p style={{ color: '#94a3b8' }}>Department-specific filters and automated capacity management.</p>
          </div>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <ShieldCheck size={32} color="var(--accent)" />
            <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Secure & Scalable</h3>
            <p style={{ color: '#94a3b8' }}>Role-based access control for staff and admins to manage high-traffic events.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
