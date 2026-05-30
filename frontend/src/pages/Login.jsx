import React  from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/clinic";


export default function Login() {
    const[username, setUsername]=useState('')
    const [password, setPassword] = useState('')
    const [loading,  setLoading]  = useState(false)
    const [error,    setError]    = useState('')
    const navigate = useNavigate()

    async function handleLogin(e) {
        e.preventDefault()
        setLoading(true)
        setError('')
        

        try{
            const res=await login(username,password)
            const {access ,refresh ,user}=res.data

            localStorage.setItem('access_token',access)
            localStorage.setItem('refresh_token',refresh)
            localStorage.setItem('user_name', user.name)
            localStorage.setItem('user_role', user.role)

            if (user.role==='doctor'){
                navigate('/doctor')
            }else{
                navigate('/admin')
            }
            window.location.reload()

        } catch (err) {
      const msg = err.response?.data?.error
      setError(msg || 'Login failed. Check your username and password.')
    } finally {
      setLoading(false)
    }
  
    }
    const s = {
        page:  { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '24px' },
        card:  { background: '#fff', borderRadius: '20px', padding: '48px 40px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
        icon:  { fontSize: '3rem', textAlign: 'center', marginBottom: '16px' },
        title: { textAlign: 'center', fontSize: '1.6rem', fontWeight: '700', marginBottom: '4px' },
        sub:   { textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '32px' },
        label: { display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '0.9rem' },
        input: { width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid var(--border)', fontSize: '1rem', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '16px', outline: 'none' },
        btn:   { width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: loading ? '#94a3b8' : 'var(--primary)', color: '#fff', fontSize: '1rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' },
        error: { background: '#fee2e2', color: '#dc2626', padding: '12px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' },
        hint:  { textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '20px' },
        roles: { background: '#f8fafc', borderRadius: '10px', padding: '16px', marginTop: '24px', fontSize: '0.82rem', color: 'var(--text-muted)' }
    }

    return(
        <div style={s.page}>
            <div style={s.cart}>
                <div style={s.icon}>🔐</div>
                <div style={s.title}> Staff Login</div>
                <div style={s.sub}>Receptionist/Doctor/Admin</div>

                {error && <div style={s.error}>⚠️ {error}</div>}

                <form onSubmit={handleLogin}>
                    <label style={s.label}>Username</label>
                    <input type="text"
                    value={username}
                    onChange={e=>setUsername(e.target.value)}
                    style={s.input}
                    placeholder="Enter username" 
                    required
                    autoFocus
                    />
                    <label style={s.label}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={s.input}
                        placeholder="Enter password"
                        required
                    />
                     <button type="submit" style={s.btn} disabled={loading}>
                        {loading ? '⏳ Logging in...' : '→ Login'}
                    </button>
                </form>
                {/* <div style={s.roles}>
                <strong>Login roles:</strong><br />
                🔴 <strong>Superadmin</strong> — Full access (python manage.py createsuperuser)<br />
                ⚙️ <strong>Admin/Receptionist</strong> — Queue management<br />
                🩺 <strong>Doctor</strong> — Patient dashboard<br /><br />
                <em>Patients don't need to log in to book.</em>
                </div> */}

                <div style={s.hint}>
                <a href="/book" style={{ color: 'var(--primary)' }}>📋 Book as Patient →</a>
                </div>


            </div>
        </div>
    )

}