import React, { useEffect, useState } from "react";
import { getAppointments, updateAppointmentStatus } from "../api/clinic";

export default function DoctorDashboard(){
    const [ appointments, setAppointments]=useState([])
    const [loading, setLoading]=useState(true)
    const [selectedDate ,setSelectedDate]=useState(new Date().toISOString().split('T')[0])
    const[notes, setNotes]=useState({})
    const[message, setMessage]=useState('')
    const [activeTab, setActiveTab]=useState('all')

    useEffect(()=>{loadAppointments()},[selectedDate])

    async function loadAppointments(params) {
        setLoading(true)
        try{
            const res=await getAppointments({date:selectedDate})
            setAppointments(res.data)
        }catch(err){
            console.error(err)
        }finally{
            setLoading(false)
        }
        
    }
    async function handleStatusChange(appt,newStatus) {
        try {
      const doctorNote = notes[appt.id] || appt.doctor_notes || ''
      await updateAppointmentStatus(appt.id, newStatus, doctorNote)
      showMessage(`Updated ${appt.token_display} → ${newStatus}`)
      loadAppointments()
    } catch (err) {
      showMessage('Update failed. Please try again.')
    }
    }
    function showMessage(msg){
        setMessage(msg)
        setTimeout(()=>setMessage(''),3500)
    }

    const filtered = appointments.filter(a => {
    if (activeTab === 'waiting') return ['booked', 'waiting', 'called', 'serving'].includes(a.status)
    if (activeTab === 'served')  return a.status === 'served'
    return true
  })

   const s = {
    page:      { minHeight: '100vh', padding: '32px 24px', maxWidth: '1000px', margin: '0 auto' },
    title:     { fontSize: '1.8rem', fontWeight: '700', marginBottom: '8px' },
    sub:       { color: 'var(--text-muted)', marginBottom: '24px' },
    toolbar:   { display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' },
    input:     { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border)', fontFamily: 'inherit', fontSize: '0.95rem' },
    tabs:      { display: 'flex', gap: '8px', marginBottom: '24px' },
    tab:       (active) => ({
      padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
      fontFamily: 'inherit', fontWeight: '600', fontSize: '0.9rem',
      background: active ? 'var(--primary)' : '#fff',
      color: active ? '#fff' : 'var(--text-muted)',
      boxShadow: 'var(--shadow)'
    }),
    toast:     { background: '#1e293b', color: '#fff', padding: '12px 20px', borderRadius: '10px', marginBottom: '16px' },
    card:      { background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow)', marginBottom: '16px', border: '1px solid var(--border)' },
    cardHeader:{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' },
    tokenBox:  { background: 'var(--primary-light)', borderRadius: '10px', padding: '12px 16px', textAlign: 'center', minWidth: '80px' },
    tokenText: { fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)' },
    patName:   { fontSize: '1.1rem', fontWeight: '700' },
    patDetail: { color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' },
    badge:     (status) => {
      const map = { booked:'#dbeafe:#1d4ed8', waiting:'#fef9c3:#92400e', called:'#ffedd5:#c2410c', serving:'#dcfce7:#15803d', served:'#f0fdf4:#16a34a', no_show:'#f1f5f9:#475569' }
      const [bg, color] = (map[status] || '#f1f5f9:#475569').split(':')
      return { display:'inline-block', padding:'3px 10px', borderRadius:'20px', fontSize:'0.78rem', fontWeight:'600', background:bg, color }
    },
    complaint: { background: '#f8fafc', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', color: 'var(--text)', marginBottom: '16px' },
    textarea:  { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border)', fontFamily: 'inherit', fontSize: '0.9rem', minHeight: '70px', resize: 'vertical', boxSizing: 'border-box' },
    actionRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' },
    btn:       (color) => ({
      padding: '8px 16px', borderRadius: '8px', border: 'none', background: color,
      color: '#fff', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem'
    }),
  }
  return (
    <div style={s.page}>
      <div style={s.title}>🩺 Doctor Dashboard</div>
      <div style={s.sub}>Today's patient list — {selectedDate}</div>

      {message && <div style={s.toast}>{message}</div>}

      <div style={s.toolbar}>
        <input type="date" value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)} style={s.input} />
        <button onClick={loadAppointments}
          style={{ ...s.btn('#0057a8'), padding: '10px 18px' }}>🔄 Refresh</button>
      </div>

      {/* Summary Tabs */}
      <div style={s.tabs}>
        <button style={s.tab(activeTab === 'all')}     onClick={() => setActiveTab('all')}>
          All ({appointments.length})
        </button>
        <button style={s.tab(activeTab === 'waiting')} onClick={() => setActiveTab('waiting')}>
          ⏳ Pending ({appointments.filter(a => ['booked','waiting','called','serving'].includes(a.status)).length})
        </button>
        <button style={s.tab(activeTab === 'served')}  onClick={() => setActiveTab('served')}>
          ✅ Served ({appointments.filter(a => a.status === 'served').length})
        </button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Loading patients...</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
          No patients in this category.
        </div>
      ) : (
        filtered.map(appt => (
          <div key={appt.id} style={s.card}>
            {/* Card Header */}
            <div style={s.cardHeader}>
              <div style={s.tokenBox}>
                <div style={s.tokenText}>{appt.token_display}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TOKEN</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={s.patName}>{appt.patient_name}</div>
                <div style={s.patDetail}>
                  {appt.patient_age && `${appt.patient_age}y`}
                  {appt.patient_gender && ` • ${appt.patient_gender === 'M' ? 'Male' : appt.patient_gender === 'F' ? 'Female' : 'Other'}`}
                  {' • 📱 '}{appt.patient_phone}
                  {appt.patient_address && ` • 📍 ${appt.patient_address}`}
                </div>
              </div>
              <span style={s.badge(appt.status)}>{appt.status_display}</span>
            </div>

            {/* Chief Complaint */}
            {appt.chief_complaint && (
              <div style={s.complaint}>
                <strong>🩺 Chief Complaint:</strong> {appt.chief_complaint}
              </div>
            )}

            {/* Doctor Notes (editable) */}
            <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
              📝 Consultation Notes / Prescription
            </label>
            <textarea
              style={s.textarea}
              value={notes[appt.id] !== undefined ? notes[appt.id] : (appt.doctor_notes || '')}
              onChange={e => setNotes(prev => ({ ...prev, [appt.id]: e.target.value }))}
              placeholder="Write diagnosis, prescription, follow-up instructions..."
            />

            {/* Action Buttons */}
            <div style={s.actionRow}>
              {appt.status === 'called' && (
                <button style={s.btn('#2d6a4f')} onClick={() => handleStatusChange(appt, 'serving')}>
                  🩺 Start Serving
                </button>
              )}
              {appt.status === 'serving' && (
                <button style={s.btn('#16a34a')} onClick={() => handleStatusChange(appt, 'served')}>
                  ✅ Mark as Served
                </button>
              )}
              {['booked', 'waiting', 'called'].includes(appt.status) && (
                <button style={s.btn('#94a3b8')} onClick={() => handleStatusChange(appt, 'no_show')}>
                  ✗ No Show
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )

}