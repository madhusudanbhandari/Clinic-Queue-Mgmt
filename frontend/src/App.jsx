import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import BookAppointment from './pages/BookAppointment.jsx'
import CheckToken from './pages/CheckToken.jsx'
import QueueDisplay from './pages/QueueDisplay.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import DoctorDashboard from './pages/DoctorDashboard.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/RegisterPage.jsx'

function ProtectedRoute({children}){
  const token=localStorage.getItem('access_token')
  return token ? children: <Navigate to="/login" replace/>

}


export default function App(){
  const [authLoading, setAuthLoading]=useState(true)

  useEffect(()=>{
    const token=localStorage.getItem('access_token')

    if(token){
      fetch('http://localhost:8000/api/me/',{
        headers:{'Authorization':'Bearer ${token}'}
      })
      .then(res=>{
        if(!res.ok) throw new Error ('Token Invalid')
          return res.json()
      })
      .then(user=>{
         localStorage.setItem('user_name', user.full_name)
          localStorage.setItem('user_role', user.role)
          if (user.doctor_info) {
            localStorage.setItem('doctor_dept_id', user.doctor_info.department_id)
            localStorage.setItem('doctor_id', user.doctor_info.id)
          }
      })
      .catch(()=>{
        localStorage.clear()
      })
      .finally(()=>setAuthLoading(false))
      

    }else{
      setAuthLoading(false)
    }
  },[])
   if (authLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontFamily: 'Poppins, sans-serif', flexDirection: 'column',
        gap: '16px', background: '#f0f4f8'
      }}>
        <div style={{ fontSize: '3rem' }}>🏥</div>
        <div style={{ color: '#0057a8', fontWeight: '600' }}>Loading Clinic System...</div>
      </div>
    )
  }


  return (
    <BrowserRouter>
    <Navbar/>
    <Routes>
      <Route path="/"    element={<Home/>}/>
      <Route path="/book"  element={<BookAppointment/>}/>
      <Route path="/check-token" element={<CheckToken />} />
      <Route path="/queue"       element={<QueueDisplay />} />
      <Route path="/login"       element={<Login />} /> 
      <Route path="/register" element={<Register/>}/>
      <Route path="/admin"  element={<ProtectedRoute><AdminPanel/></ProtectedRoute>}/> 
      <Route path="/doctor"  element={<ProtectedRoute><DoctorDashboard/></ProtectedRoute>}/>
    </Routes>
    </BrowserRouter>
  )
}
