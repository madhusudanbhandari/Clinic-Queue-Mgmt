/**
 * BOOK APPOINTMENT PAGE
 * =====================
 * Patient fills out this form to book an appointment.
 * Steps:
 *   1. Select department
 *   2. Select doctor (filtered by department)
 *   3. Fill personal info + preferred date
 *   4. Submit → get token number back
 *
 * No login required — anyone can book.
 */

import React, { useState, useEffect } from 'react'
import { getDepartments, getDoctors, bookAppointment } from '../api/clinic.js'

export default function BookAppointment() {
  const [departments, setDepartments] = useState([])
  const [doctors,     setDoctors]     = useState([])
  const [loading,     setLoading]     = useState(false)
  const [success,     setSuccess]     = useState(null)  // Holds booked appointment data on success
  const [error,       setError]       = useState('')

  // Form state — all fields in one object
  const [form, setForm] = useState({
    patient_name:    '',
    patient_phone:   '',
    patient_age:     '',
    patient_gender:  '',
    patient_address: '',
    chief_complaint: '',
    department:      '',  // Not sent to API — used to filter doctors
    doctor:          '',
    appointment_date: '',
    appointment_time: '',
  })

  // Load departments on mount
  useEffect(() => {
    getDepartments().then(res => setDepartments(res.data)).catch(console.error)
  }, [])

  // When department changes, load doctors for that department
  useEffect(() => {
    if (form.department) {
      getDoctors(form.department)
        .then(res => setDoctors(res.data))
        .catch(console.error)
      // Reset doctor selection when department changes
      setForm(prev => ({ ...prev, doctor: '' }))
    }
  }, [form.department])

  // Generic input handler — works for all form fields
  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(null)

    try {
      // Send form data to Django (excluding 'department' which is only for filtering)
      const { department, ...bookingData } = form
      const res = await bookAppointment(bookingData)
      setSuccess(res.data.appointment)  // Show success with token info
      setForm({  // Reset form
        patient_name: '', patient_phone: '', patient_age: '', patient_gender: '',
        patient_address: '', chief_complaint: '', department: '', doctor: '',
        appointment_date: '', appointment_time: ''
      })
    } catch (err) {
      // Extract error message from Django's response
      const errData = err.response?.data
      if (typeof errData === 'string') {
        setError(errData)
      } else if (errData) {
        // DRF returns field-specific errors like { "appointment_date": ["..."] }
        const messages = Object.entries(errData)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n')
        setError(messages)
      } else {
        setError('Booking failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Get today's date in YYYY-MM-DD format for min date in date picker
  const today = new Date().toISOString().split('T')[0]

  const s = {
    page:    { minHeight: '100vh', padding: '40px 24px', maxWidth: '700px', margin: '0 auto' },
    title:   { fontSize: '1.8rem', fontWeight: '700', marginBottom: '8px' },
    sub:     { color: 'var(--text-muted)', marginBottom: '32px' },
    card:    { background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow)' },
    group:   { marginBottom: '20px' },
    label:   { display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '0.9rem' },
    input:   {
      width: '100%', padding: '12px 14px', borderRadius: '8px',
      border: '1.5px solid var(--border)', fontSize: '1rem',
      fontFamily: 'inherit', outline: 'none', transition: 'border 0.2s',
    },
    select:  {
      width: '100%', padding: '12px 14px', borderRadius: '8px',
      border: '1.5px solid var(--border)', fontSize: '1rem',
      fontFamily: 'inherit', background: '#fff', cursor: 'pointer'
    },
    row:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    btn:     {
      width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
      background: loading ? '#94a3b8' : 'var(--primary)',
      color: '#fff', fontSize: '1.1rem', fontWeight: '700',
      cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
      marginTop: '8px'
    },
    error:   {
      background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px',
      padding: '12px 16px', color: '#dc2626', marginBottom: '20px',
      whiteSpace: 'pre-line', fontSize: '0.9rem'
    },
    success: {
      background: 'linear-gradient(135deg, #0057a8, #003d7a)',
      borderRadius: '16px', padding: '40px 32px', textAlign: 'center', color: '#fff'
    },
    token:   { fontSize: '4rem', fontWeight: '800', margin: '16px 0', letterSpacing: '4px' },
    sectionDivider: { color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '24px 0 16px', fontWeight: '600' }
  }

  // ── Success Screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={s.page}>
        <div style={s.success}>
          <div style={{ fontSize: '3rem' }}>🎉</div>
          <h2 style={{ fontSize: '1.5rem', margin: '12px 0 4px' }}>Appointment Booked!</h2>
          <p style={{ opacity: 0.85, marginBottom: '24px' }}>Please save your token number</p>

          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
            <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>Your Token Number</div>
            <div style={s.token}>{success.token_display}</div>
            <div style={{ opacity: 0.85 }}>{success.patient_name}</div>
            <div style={{ opacity: 0.7, fontSize: '0.9rem', marginTop: '4px' }}>
              {success.appointment_date} • {success.doctor_name}
            </div>
          </div>

          <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '24px' }}>
            📱 Remember your phone number to check queue status.<br />
            Show this token at reception when you arrive.
          </p>

          <button
            style={{ ...s.btn, marginTop: 0 }}
            onClick={() => setSuccess(null)}
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    )
  }

  // ── Booking Form ───────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <div style={s.title}>📋 Book Appointment</div>
      <div style={s.sub}>Fill in your details to get a queue token instantly.</div>

      <div style={s.card}>
        {error && <div style={s.error}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>

          {/* ── Department & Doctor Selection ── */}
          <div style={s.sectionDivider}>Step 1 — Select Department & Doctor</div>

          <div style={s.group}>
            <label style={s.label}>Department *</label>
            <select name="department" value={form.department} onChange={handleChange} style={s.select} required>
              <option value="">— Select Department —</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div style={s.group}>
            <label style={s.label}>Doctor *</label>
            <select
              name="doctor" value={form.doctor} onChange={handleChange}
              style={s.select} required disabled={!form.department}
            >
              <option value="">— Select Doctor —</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  Dr. {d.full_name} — Rs. {d.consultation_fee} | {d.qualification}
                </option>
              ))}
            </select>
            {form.department && doctors.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                No doctors available in this department.
              </div>
            )}
          </div>

          {/* ── Date & Time ── */}
          <div style={s.row}>
            <div style={s.group}>
              <label style={s.label}>Appointment Date *</label>
              <input type="date" name="appointment_date" value={form.appointment_date}
                onChange={handleChange} style={s.input} min={today} required />
            </div>
            <div style={s.group}>
              <label style={s.label}>Preferred Time</label>
              <input type="time" name="appointment_time" value={form.appointment_time}
                onChange={handleChange} style={s.input} />
            </div>
          </div>

          {/* ── Patient Info ── */}
          <div style={s.sectionDivider}>Step 2 — Your Information</div>

          <div style={s.group}>
            <label style={s.label}>Full Name (Puraa Naam) *</label>
            <input type="text" name="patient_name" value={form.patient_name}
              onChange={handleChange} style={s.input} placeholder="e.g., Ram Bahadur Sharma"
              required />
          </div>

          <div style={s.row}>
            <div style={s.group}>
              <label style={s.label}>Phone Number *</label>
              <input type="tel" name="patient_phone" value={form.patient_phone}
                onChange={handleChange} style={s.input} placeholder="98XXXXXXXX" required />
            </div>
            <div style={s.group}>
              <label style={s.label}>Age</label>
              <input type="number" name="patient_age" value={form.patient_age}
                onChange={handleChange} style={s.input} placeholder="e.g., 35" min="0" max="120" />
            </div>
          </div>

          <div style={s.row}>
            <div style={s.group}>
              <label style={s.label}>Gender</label>
              <select name="patient_gender" value={form.patient_gender}
                onChange={handleChange} style={s.select}>
                <option value="">— Select —</option>
                <option value="M">Male (Purush)</option>
                <option value="F">Female (Mahila)</option>
                <option value="O">Other</option>
              </select>
            </div>
            <div style={s.group}>
              <label style={s.label}>Address / District</label>
              <input type="text" name="patient_address" value={form.patient_address}
                onChange={handleChange} style={s.input} placeholder="e.g., Lalitpur, Bagmati" />
            </div>
          </div>

          <div style={s.group}>
            <label style={s.label}>Chief Complaint (Problem) *</label>
            <textarea name="chief_complaint" value={form.chief_complaint}
              onChange={handleChange} style={{ ...s.input, height: '80px', resize: 'vertical' }}
              placeholder="Describe your main health problem / Apno samasya lekhnus..." required />
          </div>

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? '⏳ Booking...' : '✅ Book Appointment & Get Token'}
          </button>
        </form>
      </div>
    </div>
  )
}