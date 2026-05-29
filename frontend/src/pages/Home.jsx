import { useState,useEffect } from "react";
import { Link } from "react-router-dom";
import { getTodayStats,getQueueStatus } from "../api/clinic";



export default function Home(){
    const[stats,setStats]=useState(null)
    const [queues, setQueues]=useState([])
    const [loading,setLoading]=useState(true)

    useEffect(()=>{
        fetchData()
        const interval=setInterval(fetchData,30000)
        return ()=>clearInterval(interval)

    },[])


    async function fetchData() {
        try{
            const[statsRes,queueRes]=await Promise.all([
                getTodayStats(),
                getQueueStatus()
            ])
            setStats(statsRes.data)
            setQueues(queueRes.data)
        }catch(err){
            console.error('Failed to fetch data:',err)
        }finally{
            setLoading(false)
        }
        
    }

  
  const s = { 
    page: { minHeight: '100vh', padding: '40px 24px', maxWidth: '1100px', margin: '0 auto' },
    hero: {
      textAlign: 'center', padding: '60px 24px 40px',
      background: 'linear-gradient(135deg, #0057a8 0%, #003d7a 100%)',
      borderRadius: '20px', color: '#fff', marginBottom: '40px'
    },
    heroTitle: { fontSize: '2.5rem', fontWeight: '700', marginBottom: '12px' },
    heroSub:   { fontSize: '1.1rem', opacity: 0.85, marginBottom: '32px' },
    heroButtons: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
    btnPrimary: {
      background: 'transparent', color: '#fff', padding: '14px 28px',
      borderRadius: '10px', textDecoration: 'none', fontWeight: '700', 
      border: '2px solid rgba(255,255,255,0.6)', fontSize: '1rem'
    },
    btnOutline: {
      background: 'transparent', color: '#fff', padding: '14px 28px',
      borderRadius: '10px', textDecoration: 'none', fontWeight: '600',
      border: '2px solid rgba(255,255,255,0.6)', fontSize: '1rem'
    },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px' },
    statCard: (color) => ({
      background: '#fff', borderRadius: '12px', padding: '24px 20px',
      textAlign: 'center', boxShadow: 'var(--shadow)',
      borderTop: `4px solid ${color}`
    }),
    statNum: (color) => ({ fontSize: '2.5rem', fontWeight: '700', color }),
    statLabel: { color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' },
    sectionTitle: { fontSize: '1.3rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text)' },
    queueGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' },
    queueCard: {
      background: '#fff', borderRadius: '12px', padding: '24px', textAlign: 'center',
      boxShadow: 'var(--shadow)', border: '1px solid var(--border)'
    },
    queueDept: { fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' },
    queueToken: { fontSize: '3rem', fontWeight: '800', color: 'var(--text)', lineHeight: 1.1 },
    queueLabel: { color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' },
    badge: (open) => ({
      display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem',
      fontWeight: '600', marginTop: '8px',
      background: open ? '#dcfce7' : '#fee2e2',
      color: open ? '#16a34a' : '#dc2626'
    })
  }
 return(
  <div style={s.pages}>
    <div style={s.hero}>
        <div style={s.heroTitle}>ClinicQueue Nepal</div>
        <div style={s.heroSub}>
            Dont Hurry! - take token and wait for turn!
            <small style={{opacity:0.7}}>No more long waits. Book online, take token</small>
        </div>
        <div style={s.heroButtons}>
            <Link to="/book" style={s.btnPrimary}>Book Appointment</Link>
            <Link to="/check-token" style={s.btnOutline}>Check My Token</Link>
            <Link to="/queue" style={s.btnOutline}>Live Queue Board</Link>

        </div>
    </div>


    {stats && (
        <>
           <div style={s.sectionTitle}>📊 Today's Stats — {stats.date}</div>
          <div style={s.statsGrid}>
            <div style={s.statCard('#0057a8')}>
              <div style={s.statNum('#0057a8')}>{stats.total_booked}</div>
              <div style={s.statLabel}>Total Booked</div>
            </div>
            <div style={s.statCard('#f4a261')}>
              <div style={s.statNum('#f4a261')}>{stats.waiting}</div>
              <div style={s.statLabel}>⏳ Waiting</div>
            </div>
            <div style={s.statCard('#2d6a4f')}>
              <div style={s.statNum('#2d6a4f')}>{stats.served}</div>
              <div style={s.statLabel}>✅ Served</div>
            </div>
            <div style={s.statCard('#e63946')}>
              <div style={s.statNum('#e63946')}>{stats.no_show}</div>
              <div style={s.statLabel}>❌ No Shows</div>
            </div>
          </div>
        </>
      
    )}
     <div style={s.sectionTitle}>🔴 Live Queue — Now Serving</div>
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading queue data...</p>
      ) : queues.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No active queues today.</p>
      ) : (
        <div style={s.queueGrid}>
          {queues.map(q => (
            <div key={q.id} style={s.queueCard}>
              <div style={s.queueDept}>{q.department_name}</div>
              <div style={s.queueToken}>
                {q.current_token > 0
                  ? `${q.department_code}-${String(q.current_token).padStart(3, '0')}`
                  : '—'}
              </div>
              <div style={s.queueLabel}>Now Serving</div>
              {q.waiting_count > 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
                  {q.waiting_count} waiting
                </div>
              )}
              <div style={s.badge(q.is_open)}>{q.is_open ? 'Open' : 'Closed'}</div>
            </div>
          ))}
        </div>
      )}
  </div>
 )
}