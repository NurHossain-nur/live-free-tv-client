import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { WatchPage } from './pages/WatchPage';
import LiveStreamingPlayer from './components/LiveStreamingPlayer';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Main Dashboard with Category Slider and Match Cards */}
          <Route path="/" element={<HomePage />} />
          
          {/* Streaming Player Page */}
          <Route path="/watch/:matchId" element={<WatchPage />} />

          <Route path="/live-tv" element={<LiveStreamingPlayer />} />
          
          {/* Fallback 404 Route */}
          <Route path="*" element={
            <div className="flex items-center justify-center h-[60vh] text-gray-400">
              404 | Page Not Found
            </div>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;