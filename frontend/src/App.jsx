import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from './pages/HomePage/AppLayout';
import Login from './pages/Authentication/Login'
import SignUp from './pages/Authentication/SignUp'
import Header from './components/Layout/Header'
import Sidebar from './components/Layout/Sidebar'
import UserProfile from './pages/UserProfile/UserProfile';
import ModeratorDashboard from './components/Layout/ModeratorDashboard'
import NotFound from './pages/NotFound/NotFound'
import ImageUpload from './components/ImageUpload/ImageUpload'
import Setting from './pages/Setting/Setting'
import Trendings from './pages/Authentication/Trendings'
import Home from "./pages/HomePage/Home";
import FollowersList from './pages/Followers/FollowersList';


function App() {
  return (
      <Routes>
      
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />  
        <Route path="/header" element={<Header/>} />
        <Route path="/sidebar" element={<Sidebar/>} />
        <Route path="/userprofile" element={<UserProfile/>} />
        <Route path="/" element={<AppLayout />}>
        <Route  index element={<Home />} /> </Route>
        <Route path='/moderator' element={<ModeratorDashboard />} />
        <Route path='/notfound' element={<NotFound />} />
        <Route path='/imageUpload' element={<ImageUpload />} />
        <Route path='/settings' element={<Setting />} />
        <Route path='/trendings' element={<Trendings />} />
        <Route path='/followers' element={<FollowersList />} />
        
      </Routes>
  );
}

export default App;