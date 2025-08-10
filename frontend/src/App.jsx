import './App.css'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Authentication/Login'
import SignUp from './pages/Authentication/SignUp'
import Header from './components/Layout/Header'
import Sidebar from './components/Layout/Sidebar'
import UserProfileBar from './components/Layout/UserProfileBar'
import Home from './pages/HomePage/Home'


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/header" element={<Header/>} />
        <Route path="/sidebar" element={<Sidebar/>} />
        <Route path="/userprofile" element={<UserProfileBar/>} />
  
      </Routes>
    </>
  )
}

export default App
