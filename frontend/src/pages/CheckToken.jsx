import React, { useState } from "react";
import { checkAppointmentByPhone } from "../api/clinic";

const STATUS_COLORS = {
  booked:    { bg: '#e0f2fe', color: '#0369a1' },
  waiting:   { bg: '#fef9c3', color: '#854d0e' },
  called:    { bg: '#fee2e2', color: '#b91c1c' },
  serving:   { bg: '#dcfce7', color: '#15803d' },
  served:    { bg: '#f0fdf4', color: '#16a34a' },
  no_show:   { bg: '#f1f5f9', color: '#64748b' },
  cancelled: { bg: '#f1f5f9', color: '#64748b' },
}

export default function CheckToken(){
    const [phone, setPhone] =useState('')
    const [results, setResults]=useState(null)
    const[loading, setLoading]=useState(false)
    const [error, setError]=useState('')


    async function handleSearch(e) {
        e.preventDefault()
        if (!phone.trim())return
        setLoading(true)
        setError('')
        setResults(null)
        try{
            const res=await checkAppointmentByPhone(phone.trim())
            setResults(res.data)

        }catch(err){
            if(err.response?.status===404){
                setError('No appointment found for phone number ${phone} today. Please check another date')

            }else{
                setError('Something went wrong. Please try again')
            }
        }finally{
            setLoading(false)
        }
        
    }
    
    const s = {
        page:    { minHeight: '100vh', padding: '40px 24px', maxWidth: '600px', margin: '0 auto' },
        title:   { fontSize: '1.8rem', fontWeight: '700', marginBottom: '8px' },
        sub:     { color: 'var(--text-muted)', marginBottom: '32px' },
        card:    { background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow)', marginBottom: '24px' },
        row:     { display: 'flex', gap: '12px' },
        input:   { flex: 1, padding: '12px 14px', borderRadius: '8px', border: '1.5px solid var(--border)', fontSize: '1rem', fontFamily: 'inherit' },
        btn:     { padding: '12px 24px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' },
        error:   { background: '#fee2e2', borderRadius: '8px', padding: '12px 16px', color: '#dc2626', marginTop: '16px' },
        apptCard:{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow)', marginBottom: '16px', borderLeft: '4px solid var(--primary)' },
        tokenBig:{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' },
        badge:   (status) => ({
        display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem',
        fontWeight: '600', ...STATUS_COLORS[status]
        }),
        detail:  { color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' },
    }
    return(
        <div style={s.page}>
            <div style={s.title}>Check My Token</div>
            <div style={s.sub}>Enter you phone to find todays appointment</div>

            <div style={s.card}>
                <form onSubmit={handleSearch}>
                    <div style={s.row}>
                        <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)}
                        style={s.input} placeholder="Enter your phone"
                        required
                         />
                         <button type="submit" style={s.btn} disabled={loading}>
                            {loading?'...':'Search'}
                         </button>
                    </div>
                </form>
                {error &&  <div style={s.error}>{error}</div>}
            </div>

        {results && results.map(appt=>(
            <div key={appt.id} style={s.apptCard}>
                <div style={s.tokenBig}>{appt.token_display}</div>
                <div style={{marginBottom:'12px'}}>
                    <span style={s.badge(appt.status)}>{appt.status_dislay}</span>
                </div>
                <div><strong>{appt.patient_name}</strong></div>
                <div style={s.detail}>Dr. {appt.doctor_name}-{appt.department_name}</div>
                <div style={s.detail}>{appt.appointment_date}</div>
                {appt.appointment_time && <div style={s.detail}> {appt.appointment_time}</div> }
                <div style={s.detail}>{appt.patient_phone}</div>
                {appt.cheif_complaint && <div style={s.detail}>🩺 {appt.chief_complaint}</div> }


                <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg)', borderRadius: '8px', fontSize: '0.9rem' }}>
                    {appt.status === 'booked'  && '📋 Your appointment is booked. Please arrive on time and check in at reception.'}
                    {appt.status === 'waiting' && '⏳ You are in the queue. Please stay nearby — your token may be called soon.'}
                    {appt.status === 'called'  && '📢 Your token has been called! Please proceed to the doctor\'s room immediately.'}
                    {appt.status === 'serving' && '🩺 You are currently being served. Get well soon!'}
                    {appt.status === 'served'  && '✅ Your consultation is complete. Thank you for visiting!'}
                    {appt.status === 'no_show' && '❌ You were marked as no-show. Please call the clinic to reschedule.'}
                </div>
            </div>
        ))}
            
        </div>
    )
}
