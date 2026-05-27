import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import NavBar from './components/NavBar'
import Login from './pages/Login'
import Register from './pages/Register'
import Browse from './pages/Browse'
import Cart from './pages/Cart'
import AdminPanel from './pages/AdminPanel'
import SimpleAdminPanel from './pages/SimpleAdminPanel'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'

function App(){
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <NavBar/>
            <Routes>
              <Route path="/" element={<Navigate to="/browse" replace />} />
              <Route path="/login" element={<Login/>} />
              <Route path="/register" element={<Register/>} />
              <Route path="/browse" element={<Browse/>} />
              <Route path="/cart" element={<Cart/>} />
              <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><SimpleAdminPanel/></ProtectedRoute>} />
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
              toastClassName="rounded-xl shadow-lg"
            />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>)