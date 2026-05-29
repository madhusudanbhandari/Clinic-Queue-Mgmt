import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Navbar(){
    const navigate=useNavigate()
    const location=useLocation()
    const isLoggedIn=!!localStorage.getItem('access_token')


    function handleLogout(){
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        navigate('/')
        window.location.reload()
    }

    const isActive=(path)=>location.pathname===path

    const styles = {
    nav: {
      background: 'var(--primary)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      boxShadow: '0 2px 8px rgba(0,0,50,0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    brand: {
      color: '#fff',
      textDecoration: 'none',
      fontSize: '1.2rem',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    links: {
      display: 'flex',
      gap: '4px',
      alignItems: 'center',
    },
    link: (active) => ({
      color: active ? '#fff' : 'rgba(255,255,255,0.75)',
      textDecoration: 'none',
      padding: '8px 14px',
      borderRadius: '8px',
      fontSize: '0.9rem',
      fontWeight: active ? '600' : '400',
      background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
      transition: 'all 0.2s',
    }),
    btn: {
      background: 'var(--secondary)',
      color: '#fff',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.9rem',
      fontFamily: 'inherit',
    }
  }

  return(
    <nav style={styles.nav}>
        <Link to="/" style={styles.brand}>
          ClinicQueue Nepal
        </Link>

        <div style={styles.links}>
            <Link to="/"            style={styles.link(isActive('/'))}>Home</Link>
            <Link to="/book"        style={styles.link(isActive('/book'))}>📋 Book</Link>
            <Link to="/check-token" style={styles.link(isActive('/check-token'))}>🔍 My Token</Link>
            <Link to="/queue"       style={styles.link(isActive('/queue'))}>📺 Queue Board</Link>

            {isLoggedIn?(
                <>
                 <Link to="/admin"  style={styles.link(isActive('/admin'))}>⚙️ Admin</Link>
                <Link to="/doctor" style={styles.link(isActive('/doctor'))}>🩺 Doctor</Link>
                <button style={styles.btn} onClick={handleLogout}>Logout</button>
                </>
            ):(
               <Link to="/login" style={styles.link(isActive('/login'))}>Staff Login</Link> 
            )}
        
        </div>



    </nav>
  )
}