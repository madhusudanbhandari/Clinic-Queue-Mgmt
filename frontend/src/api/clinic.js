import axios from 'axios'

const API =axios.create({
    baseURL:'http://localhost:8000/api',
    headers:{'Content-Type':'application/json'}

})


API.interceptors.request.use((config)=>{
    const token=localStorage.getItem('access_token')
    if (token){
        config.headers.Authorization=`Bearer ${token}`

    }
    return config
})
export const register=(username,email,password)=>
    API.post('/register/',{username,email,password})

export const login=(username,password)=>
    API.post('/login/',{username,password})

export const logout=()=>{
    API.post('/logout/',{refresh:localStorage.getItem('refresh_token')})

}

export const getCurretnUser=()=>API.get('/me/')

export const getDepartments=()=>API.get('/departments/')

export const getDoctors=(departmentId=null)=>{
    API.get('/doctors/',{params:departmentId? {department:departmentId}:{}})
}

export const bookAppointment=(data)=>API.post('/appointments/',data)


export const getAppointments=(filters={})=>
    API.fet('/appointments/list/',{params:filters})


export const checkAppointmentByPhone=(phone)=>
    API.get('/appointments/check/${phone}/')

export const updateAppointmentStatus=(id,status,doctorNotes='')=>
    API.patch('/appointments/${id}/update-status/',{status,doctor_notes:doctorNotes})

export const getQueueStatus=()=>API.get('/queue-status')

export const callNextPatient=(departmentId)=>{
    API.post('/queue/call-next/',{department_id:departmentId})
}

export const getTodayStats=()=>API.get('/stats/')