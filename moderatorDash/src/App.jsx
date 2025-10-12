import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PostMonitoring from './pages/PostMonitoring';
import CommentAnalysis from './pages/CommentAnalysis';
import UserActivity from './pages/UserActivity';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/posts" element={<PostMonitoring />} />
          <Route path="/comments" element={<CommentAnalysis />} />
          <Route path="/users" element={<UserActivity />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
