import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './Component/Pages/Home'
import Login from './Component/Pages/Login'
import SignUp from './Component/Pages/SignUp'
import DocumentUploadForm from './Component/Pages/DocumentUpload'
import AdminDashboard from './Component/Pages/Dashboards/AdminDashboardNew'
import CustomerDashboard from './Component/Pages/Dashboards/CustomerDashboard'
import TeamleaderDashboard from './Component/Pages/Dashboards/TeamLeaderDashboardNew'
import SuperAdminDashboard from './Component/Pages/Dashboards/SuperAdminDashboardNew'
import EmployeeDashboard from './Component/Pages/Dashboards/EmployeeDashboardNew'
import BdDashboard from './Component/Pages/Dashboards/BDDashboardNew'
import HROperationsDashboard from './Component/Pages/Dashboards/HROperationsDashboardNew'
import HRRecruitmentDashboard from './Component/Pages/Dashboards/HRRecruitmentDashboardNew'
import DepartmentMemberDashboard from './Component/Pages/Dashboards/DepartmentMemberDashboard'
import ClientModularDashboard from './Component/Pages/Dashboards/ClientModularDashboard'
import RecruitmentHeadDashboard from './Component/Pages/Dashboards/RecruitmentHeadDashboard'
import KAMMemberDashboard from './Component/Pages/Dashboards/KAMMemberDashboard'
import ResetPassword from './Component/Pages/reset_password'
import ForgotPassword from './Component/Pages/forgetpassword'
import ClientLogin from './Component/Pages/ClientLogin'
import DepartmentProtectedRoute from './Component/Pages/DepartmentProtectedRoute'
import ProtectedRoute from './Component/Pages/ProtectedRoute'

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
      <Route path='/bd-dashboard' element={
        <ProtectedRoute allowedRoles={['bd']}>
          <BdDashboard />
        </ProtectedRoute>
      } />
      
      {/* Department Protected Routes */}
      <Route path='/kam-operations-dashboard' element={
        <DepartmentProtectedRoute allowedDepartment="HR Operations">
          <HROperationsDashboard />
        </DepartmentProtectedRoute>
      } />
      <Route path='/kam-recruitment-dashboard' element={
        <DepartmentProtectedRoute allowedDepartment="HR Recruitment">
          <HRRecruitmentDashboard />
        </DepartmentProtectedRoute>
      } />
      <Route path='/department-member-dashboard' element={
        <DepartmentProtectedRoute allowedDepartment="Both">
          <DepartmentMemberDashboard />
        </DepartmentProtectedRoute>
      } />

      <Route path='/document-upload' element={<DocumentUploadForm />} />
      <Route path='/admin-dashboard' element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path='/client-dashboard' element={
        <ProtectedRoute allowedRoles={['admin', 'customer', 'client']}>
          <ClientModularDashboard />
        </ProtectedRoute>
      } />
      <Route path='/client-dashboard-legacy' element={
        <ProtectedRoute allowedRoles={['admin', 'customer', 'client']}>
          <CustomerDashboard />
        </ProtectedRoute>
      } />
      <Route path='/teamleader-dashboard' element={
        <ProtectedRoute allowedRoles={['teamleader']}>
          <TeamleaderDashboard />
        </ProtectedRoute>
      } />
      <Route path='/superadmin-dashboard' element={
        <ProtectedRoute allowedRoles={['superadmin']}>
          <SuperAdminDashboard />
        </ProtectedRoute>
      } />
      <Route path='/employee-dashboard' element={
        <ProtectedRoute allowedRoles={['employee']}>
          <EmployeeDashboard />
        </ProtectedRoute>
      } />
      
      {/* Recruitment Head Dashboard - Sachin */}
      <Route path='/recruitment-head-dashboard' element={
        <DepartmentProtectedRoute allowedDepartment="HR Recruitment">
          <RecruitmentHeadDashboard />
        </DepartmentProtectedRoute>
      } />
      
      {/* KAM Member Dashboard - Priyanshi, Manju, Jyoti */}
      <Route path='/kam-member-dashboard' element={
        <DepartmentProtectedRoute allowedDepartment="HR Recruitment">
          <KAMMemberDashboard />
        </DepartmentProtectedRoute>
      } />
     
    </Routes>
  )
}

export default App

