import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';
import { Calendar, User, LogOut, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('user_role');
    setIsLoggedIn(!!token);
    setIsAdmin(role === 'admin');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    setIsLoggedIn(false);
    setIsAdmin(false);
    router.push('/');
    router.refresh();
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Calendar className={styles.logoIcon} />
          <span>College<span className={styles.highlight}>EMS</span></span>
        </Link>
        
        <div className={styles.links}>
          <Link href="/events" className={styles.link}>Events</Link>
          {isLoggedIn && !isAdmin && <Link href="/dashboard" className={styles.link}>My Events</Link>}
          {!isLoggedIn && <Link href="/signup" className={styles.link} style={{ color: 'var(--secondary)' }}>Join</Link>}
          {isAdmin && <Link href="/admin" className={styles.link} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Admin Panel</Link>}
          
          {isLoggedIn ? (
            <button onClick={handleLogout} className={styles.loginBtn} style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#fb7185', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          ) : (
            <Link href="/login" className={styles.loginBtn}>
              <User size={18} />
              <span>Login</span>
            </Link>
          )}
        </div>
        
        <button className={styles.mobileMenu}>
          <Menu />
        </button>
      </div>
    </nav>
  );
}
