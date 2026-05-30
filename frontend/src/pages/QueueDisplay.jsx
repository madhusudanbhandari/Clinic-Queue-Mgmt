import React, { useEffect, useState }  from "react";
import { getQueueStatus } from "../api/clinic";


export default function QueueDisplay(){
    const[queues, setQueues]=useState([])
    const[lastUpdate, setLastUpdate]=useState(new Date())
    const [loading, setLoading]=useState(true)

    useEffect(()=>{
        fetchQueues()
        const interval=setInterval(()=>{
            fetchQueues()
            setLastUpdate(new Date())
        },10000)
        return ()=> clearInterval(interval)
    },[])
    async function fetchQueues() {
        try{
            const res=await getQueueStatus()
            setQueues(res.data)
        }catch(err){
            console.error('Queue fetch error:',err)
        }finally{
            setLoading(false)
        }
        
    }
    const formatTime=(date)=>
        date.toLocaleTimeString('ne-NP', {hour:'2-digit', minute:'2-digit'})

   
  const s = {
    page: {
      minHeight: '100vh', background: '#0a0a1a',
      color: '#fff', padding: '32px', fontFamily: 'Poppins, sans-serif'
    },
    header: { textAlign: 'center', marginBottom: '48px' },
    title:  { fontSize: '2.5rem', fontWeight: '800', color: '#60a5fa', marginBottom: '8px' },
    sub:    { color: '#94a3b8', fontSize: '1rem' },
    grid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' },
    card:   (open) => ({
      background: open ? '#0f172a' : '#1a0000',
      border: `2px solid ${open ? '#1e40af' : '#450a0a'}`,
      borderRadius: '20px', padding: '32px', textAlign: 'center',
      boxShadow: open ? '0 0 40px rgba(59,130,246,0.15)' : 'none',
      transition: 'all 0.3s'
    }),
    deptCode: { fontSize: '0.85rem', letterSpacing: '3px', color: '#60a5fa', fontWeight: '700', textTransform: 'uppercase' },
    deptName: { fontSize: '1.4rem', fontWeight: '700', margin: '8px 0 24px', color: '#e2e8f0' },
    nowLabel: { fontSize: '0.8rem', letterSpacing: '2px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' },
    tokenNum: { fontSize: '5rem', fontWeight: '900', lineHeight: 1, color: '#f0f9ff',
      textShadow: '0 0 40px rgba(96,165,250,0.4)', marginBottom: '4px' },
    waiting: { color: '#f59e0b', fontSize: '0.9rem', marginTop: '16px', fontWeight: '600' },
    closedBadge: { background: '#7f1d1d', color: '#fca5a5', padding: '4px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', display: 'inline-block', marginTop: '12px' },
    openBadge:   { background: '#14532d', color: '#86efac', padding: '4px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', display: 'inline-block', marginTop: '12px' },
    footer: { textAlign: 'center', marginTop: '48px', color: '#334155', fontSize: '0.85rem' },
    pulse: {
      display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%',
      background: '#22c55e', marginRight: '6px',
      animation: 'pulse 2s infinite'
    }
  }

  if (loading) {
    return (
      <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#60a5fa' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏥</div>
          <div>Loading queue...</div>
        </div>
      </div>
    )
  }
 
  return (
    <div style={s.page}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }`}</style>

      <div style={s.header}>
        <div style={s.title}>🏥 QUEUE DISPLAY BOARD</div>
        <div style={s.sub}>
          <span style={s.pulse} />
          LIVE — Updated {formatTime(lastUpdate)}
        </div>
      </div>

      {queues.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#475569', fontSize: '1.5rem', marginTop: '80px' }}>
          No active queues at the moment.
        </div>
      ) : (
        <div style={s.grid}>
          {queues.map(q => (
            <div key={q.id} style={s.card(q.is_open)}>
              <div style={s.deptCode}>{q.department_code}</div>
              <div style={s.deptName}>{q.department_name}</div>
              <div style={s.nowLabel}>Now Serving</div>
              <div style={s.tokenNum}>
                {q.current_token > 0
                  ? `${q.department_code}-${String(q.current_token).padStart(3, '0')}`
                  : '—'}
              </div>
              {q.waiting_count > 0 && (
                <div style={s.waiting}>⏳ {q.waiting_count} patient{q.waiting_count > 1 ? 's' : ''} waiting</div>
              )}
              <div style={q.is_open ? s.openBadge : s.closedBadge}>
                {q.is_open ? '🟢 OPEN' : '🔴 CLOSED'}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={s.footer}>
        ClinicQueue Nepal • Auto-refreshes every 10 seconds • Please listen for your token announcement
      </div>
    </div>
  )
}