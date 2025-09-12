import { Navigate, Route, Routes } from 'react-router-dom'
import { AllRoles, AuditPackages, AuditUser, Clients, Dashboard, Feedbacks, FeedbacksCsv, Packages, Reports, Roles, SignIn, UpdatePackage, UserAdd, UsersList } from './pages'
import { BlankLayout } from './layouts'
import { Toaster } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { ProtectedLayout } from './Components'

function App() {


  
  function PublicOnly({ children }) {
    const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
    const token = useSelector((s) => s.auth.token);
    const authed = isAuthenticated || !!token;
    return authed ? <Navigate to="/" replace /> : children;
  }



  return (
    <>
      <Routes>
        <Route path="/signin" element={<PublicOnly><BlankLayout><SignIn /></BlankLayout></PublicOnly>} />
        {/* Protected block (ALL routes inside are blocked if not logged in) */}
        <Route element={<ProtectedLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/all-clients" element={<Clients />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users/add" element={<UserAdd />} />
          <Route path="/users/details/:userId" element={<UserAdd />} />
          <Route path="/users/list" element={<UsersList />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/all-roles" element={<AllRoles />} />
          <Route path="/roles/select-update" element={<Roles />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/feedbacks" element={<Feedbacks />} />
          <Route path="/feedbacks-csv" element={<FeedbacksCsv />} />
        
          <Route path="/package/select-update/:id" element={<UpdatePackage />} />
          <Route path="/packages/create-package" element={<UpdatePackage />} />
          <Route path="/audit/packages" element={<AuditPackages />} />
          <Route path="/audit/users" element={<AuditUser />} />
        </Route>

        <Route path="*" element={<Navigate to="/signin" replace />} />
        
      </Routes>

      <Toaster position="top-right" reverseOrder={false} />
    </>
  )
}

export default App;
