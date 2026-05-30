import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import BookAppointment from './pages/BookAppointment.jsx'
import CheckToken from './pages/CheckToken.jsx'
import QueueDisplay from './pages/QueueDisplay.jsx'
//import AdminPanel from './pages/AdminPanel.jsx'
// import DoctorDashboard from './pages/DoctorDashboard.jsx'
// import Login from './pages/Login.jsx'

// function ProtectedRoute({children}){
//   const token=localStorage.getItem('access_token')
//   return token ? children: <Navigate to="/login" replace/>

// }


export default function App(){
  return (
    <BrowserRouter>
    <Navbar/>
    <Routes>
      <Route path="/"    element={<Home/>}/>
      <Route path="/book"  element={<BookAppointment/>}/>
      <Route path="/check-token" element={<CheckToken />} />
      <Route path="/queue"       element={<QueueDisplay />} />
      {/* <Route path="/login"       element={<Login />} /> */}
    
      {/* <Route path="/admin"  element={<ProtectedRoute><AdminPanel/></ProtectedRoute>}/> */}
      {/* <Route path="/doctor"  element={<ProtectedRoute><DoctorDashboard/></ProtectedRoute>}/> */}
    </Routes>
    </BrowserRouter>
  )
}
