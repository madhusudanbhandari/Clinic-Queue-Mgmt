import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/clinic";


export default function Register(){
    const[formData, setFormData]=useState({
        username:'',
        email:'',
        password:''
    })
    const handleChange=(e)=>{
        setFormData({
            ...formData,
            [e.target.name]:e.target.value,
        });
    };

    const registerUser=async(e)=>{
        e.preventDefault()

        try{
            const response=await register(
                formData.username,
                formData.email,
                formData.password
            )
            console.log(response.data)
            alert('Registration Successfull')
        }catch(error){
            console.log(error.response?.data)
        }
    }


    const s={
        page:  { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '24px' },
        card:  { background: '#fff', borderRadius: '20px', padding: '48px 40px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
        label: { display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '0.9rem' },
        input: { width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid var(--border)', fontSize: '1rem', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '16px', outline: 'none' },
        btn:   { width: '100%', padding: '14px', borderRadius: '10px', border: 'none',  color: 'white', fontSize: '1rem', fontWeight: '700',backgroundColor:'green' },

    }
    return(
    <div style={s.page}>
        <div style={s.card}>
        <p>Register Here </p>
        <form action="" onSubmit={registerUser}>
            <label style={s.label} >UserName</label> 
            <input type="text"  style={s.input} name="username" placeholder="Username" onChange={handleChange}/><br />
            <label style={s.label} >Email</label>
            <input type="text" style={s.input} name="email" placeholder="Email" onChange={handleChange}/>
            <label style={s.label}>Password</label>
            <input type="password" style={s.input} name="password" placeholder="Password" onChange={handleChange}/>
            <button type="submit" style={s.btn} >Register</button>
        </form>
        </div>
    </div>
    )
}