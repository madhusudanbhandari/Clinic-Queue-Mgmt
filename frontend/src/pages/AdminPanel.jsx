import React, { useEffect } from "react";
import { getDepartments,getAppointments,updateAppointmentStatus,callNextPatient } from "../api/clinic";

const STATUS_STYLES = {
  booked:    { bg: '#dbeafe', color: '#1d4ed8' },
  waiting:   { bg: '#fef9c3', color: '#92400e' },
  called:    { bg: '#ffedd5', color: '#c2410c' },
  serving:   { bg: '#dcfce7', color: '#15803d' },
  served:    { bg: '#f0fdf4', color: '#16a34a' },
  no_show:   { bg: '#f1f5f9', color: '#475569' },
  cancelled: { bg: '#f1f5f9', color: '#475569' },
}


export default function AdminPanel(){
  const [departments,   setDepartments]   = useState([])
  const [appointments,  setAppointments]  = useState([])
  const [selectedDept,  setSelectedDept]  = useState('')
  const [selectedDate,  setSelectedDate]  = useState(new Date().toISOString().split('T')[0])
  const [loading,       setLoading]       = useState(false)
  const [callingNext,   setCallingNext]   = useState(false)
  const [message,       setMessage]       = useState('')


  useEffect(()=>{
    getDepartments().then(res=>setDepartments(res.data))
  },[])

  useEffect(()=>{
    loadAppointments()
  },[selectedDept,selectedDate])

  async function loadAppointments(params) {
    setLoading(true)
    try{
        const filters={date:selectedDate}
        if(selectedDate) filters.department=selectedDept
        const res=await getAppointments(filters)
        setAppointments(res.data)
    }catch(err){
        console.error('Failed to load appointments:',err)
    }finally{
        setLoading(false)
    }
    
  }
  async function changeStatus(id, newStatus) {
    try{
        await updateAppointmentStatus(id,newStatus)
        showMessage('Status Updated to "${newStaus}"')
        loadAppointments()
    }catch(err){
        showMessage('Failed to update status')
    }
    
  }
  async function  handleCallNext() {
    if (!selectedDept){
        showMessage('Please select department first.')
        return
    }
    setCallingNext(true)
    try{
        const res=await callNextPatient(selectedDept)
        showMessage('Called: ${res.data.token_display}-${res.data.patient_name}')
        loadAppointments()
  }catch(err){
    showMessage('No patients waitig or error occured')
  }finally{
    setCallingNext(false)
  }
}
function showMessage(msg){
    setMessage(msg)
    setTimeout(()=>setMessage(''),4000)
}   
const statusCounts=appointments.reduce((acc,a)=>{
    acc[a.status] = (acc[a.status] || 0) + 1
    return acc
},{})
 const s = {
    page:    { minHeight: '100vh', padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' },
    title:   { fontSize: '1.8rem', fontWeight: '700', marginBottom: '24px' },
    toolbar: { display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' },
    select:  { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border)', fontSize: '0.95rem', fontFamily: 'inherit', background: '#fff' },
    input:   { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border)', fontSize: '0.95rem', fontFamily: 'inherit' },
    btn:     (color) => ({
      padding: '10px 20px', borderRadius: '8px', border: 'none',
      background: color, color: '#fff', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit'
    }),
    toast:   { background: '#1e293b', color: '#fff', padding: '12px 20px', borderRadius: '10px', marginBottom: '16px', fontWeight: '500' },
    summaryRow: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' },
    chip:    (bg, color) => ({
      padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem',
      fontWeight: '600', background: bg, color
    }),
    table:   { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow)' },
    th:      { padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', background: '#f8fafc', borderBottom: '1px solid var(--border)' },
    td:      { padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: '0.95rem', verticalAlign: 'middle' },
    badge:   (status) => ({
      display: 'inline-block', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem',
      fontWeight: '600', ...STATUS_STYLES[status]
    }),
    actionRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
    smallBtn: (color) => ({
      padding: '5px 10px', borderRadius: '6px', border: 'none',
      background: color, color: '#fff', fontSize: '0.78rem', fontWeight: '600',
      cursor: 'pointer', fontFamily: 'inherit'
    }),
  }

  return(
    <div style={s.page}>
        <div style={s.title}>Admin/Reception Panel</div>

        {message && <div style={s.toast}>{message}</div>}

        <div style={s.toolbar}>
            <select value={selectedDept} onChange={e=>setSelectedDept(e.target.value)}>
                <option value="">All Departments</option>
                {departments.map(d=> <option key={d.id}>{d.name}</option>)}
            </select>

            <input type="date"  value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} style={s.input}/>
            <button onClick={loadAppointments} style={s.btn('#0057a8')}>Refresh</button>

            <button onClick={handleCallNext} disabled={callingNext} style={s.btn('#16a34a')}>
            {callingNext ? '⏳ Calling...' : '📢 Call Next Patient'}
            </button>
        </div>
        <div style={s.summaryRow}>
        <span style={s.chip('#e0f2fe', '#0369a1')}>📋 Booked: {statusCounts.booked || 0}</span>
        <span style={s.chip('#fef9c3', '#92400e')}>⏳ Waiting: {statusCounts.waiting || 0}</span>
        <span style={s.chip('#ffedd5', '#c2410c')}>📢 Called: {statusCounts.called || 0}</span>
        <span style={s.chip('#dcfce7', '#15803d')}>🩺 Serving: {statusCounts.serving || 0}</span>
        <span style={s.chip('#f0fdf4', '#16a34a')}>✅ Served: {statusCounts.served || 0}</span>
        <span style={s.chip('#f1f5f9', '#475569')}>❌ No Show: {statusCounts.no_show || 0}</span>
      </div>
        {loading ? (
        <div style={{ color: 'var(--text-muted)', padding: '40px', textAlign: 'center' }}>Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', padding: '40px', textAlign: 'center' }}>
          No appointments found for selected filters.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Token</th>
                <th style={s.th}>Patient</th>
                <th style={s.th}>Phone</th>
                <th style={s.th}>Doctor / Dept</th>
                <th style={s.th}>Problem</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(appt => (
                <tr key={appt.id}>
                  <td style={s.td}>
                    <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
                      {appt.token_display}
                    </strong>
                  </td>
                  <td style={s.td}>
                    <div style={{ fontWeight: '600' }}>{appt.patient_name}</div>
                    {appt.patient_age && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {appt.patient_age}y • {appt.patient_gender === 'M' ? 'Male' : appt.patient_gender === 'F' ? 'Female' : 'Other'}
                      </div>
                    )}
                  </td>
                  <td style={s.td}>{appt.patient_phone}</td>
                  <td style={s.td}>
                    <div style={{ fontWeight: '500' }}>Dr. {appt.doctor_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{appt.department_name}</div>
                  </td>
                  <td style={s.td}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '160px' }}>
                      {appt.chief_complaint || '—'}
                    </div>
                  </td>
                  <td style={s.td}>
                    <span style={s.badge(appt.status)}>{appt.status_display}</span>
                  </td>
                  <td style={s.td}>
                    {/* Show relevant action buttons based on current status */}
                    <div style={s.actionRow}>
                      {appt.status === 'booked' && (
                        <button style={s.smallBtn('#f59e0b')} onClick={() => changeStatus(appt.id, 'waiting')}>
                          ✓ Arrived
                        </button>
                      )}
                      {appt.status === 'waiting' && (
                        <button style={s.smallBtn('#e63946')} onClick={() => changeStatus(appt.id, 'called')}>
                          📢 Call
                        </button>
                      )}
                      {appt.status === 'called' && (
                        <button style={s.smallBtn('#16a34a')} onClick={() => changeStatus(appt.id, 'serving')}>
                          🩺 Serving
                        </button>
                      )}
                      {appt.status === 'serving' && (
                        <button style={s.smallBtn('#16a34a')} onClick={() => changeStatus(appt.id, 'served')}>
                          ✅ Done
                        </button>
                      )}
                      {['booked', 'waiting', 'called'].includes(appt.status) && (
                        <button style={s.smallBtn('#64748b')} onClick={() => changeStatus(appt.id, 'no_show')}>
                          ✗ No Show
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

}