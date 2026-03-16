import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './Component/Pages/Home'
import Login from './Component/Pages/Login'
import SignUp from './Component/Pages/SignUp'
import DocumentUploadForm from './Component/Pages/DocumentUpload'
import ClientDashboard from './Component/Pages/Dashboards/ClientDashboard'
import CustomerDashboard from './Component/Pages/Dashboards/CustomerDashboard'
import TeamleaderDashboard from './Component/Pages/Dashboards/TeamleaderDashboard'
import SuperAdminDashboard from './Component/Pages/Dashboards/SuperAdmindashboard'
import EmployeeDashboard from './Component/Pages/Dashboards/EmployeeDashboard'
import BdDashboard from './Component/Pages/Dashboards/BdDashboard'
import KamDashboard from './Component/Pages/Dashboards/KamDashboard'
import ResetPassword from './Component/Pages/reset_password'
import ForgotPassword from './Component/Pages/forgetpassword'
import ClientLogin from './Component/Pages/ClientLogin'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<SignUp />} />
      <Route path='/forgot-password' element={<ForgotPassword />}/>
      <Route path='/reset-password/:token/:userType' element={<ResetPassword />} />
      <Route path='/reset-password' element={<ResetPassword />} />
      <Route path='/client-login' element={<ClientLogin />} />
      <Route path='/bd-dashboard' element={<BdDashboard />} />
      <Route path='/kam-dashboard' element={<KamDashboard />} />

      <Route path='/document-upload' element={<DocumentUploadForm />} />
      <Route path='/admin-dashboard' element={<ClientDashboard />} />
      <Route path='/client-dashboard' element={<CustomerDashboard />} />
      <Route path='/teamleader-dashboard' element={<TeamleaderDashboard />} />
      <Route path='/superadmin-dashboard' element={<SuperAdminDashboard />} />
      <Route path='/employee-dashboard' element={<EmployeeDashboard />} />
     
    </Routes>
  )
}

export default App

