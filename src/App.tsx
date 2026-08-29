import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { HouseholdProvider } from '@/context/HouseholdContext'
import { AppRoutes } from '@/routes/AppRoutes'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HouseholdProvider>
          <AppRoutes />
        </HouseholdProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
