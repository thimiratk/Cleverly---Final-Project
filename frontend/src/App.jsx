// App.jsx
import './App.css';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './pages/HomePage/AppLayout';
import Home from './pages/HomePage/Home';
import Login from './pages/Authentication/Login';
import SignUp from './pages/Authentication/SignUp';
import ForgotPassword from './pages/Authentication/ForgotPassword';
import UserProfile from './pages/UserProfile/UserProfile';


function App() {
  return (  
    <Routes>
      {/* Public Routes (No layout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="userprofile" element={<UserProfile />} />

      {/* Main Application Routes (with AppLayout) */}
      <Route path="/" element={<AppLayout />}>
        {/* These components will be rendered inside the <Outlet /> in AppLayout */}
        <Route index element={<Home />} />
        
        {/* You can add more routes here for other pages */}
      </Route>
    </Routes>
  );
}

export default App;