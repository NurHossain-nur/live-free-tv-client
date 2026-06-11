import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
// import { HomePageUI } from './pages/HomePage';
import { WatchPage } from './pages/WatchPage';
import LiveStreamingPlayer from './components/LiveStreamingPlayer';
import { HomePageUI } from './pages/HomePageUI';
import { MatchDetail } from './components/MatchDetail/MatchDetail';
import { PlayerRatingView } from './components/MatchDetail/PlayerRatingView';
import { StatsDashboard } from './components/StatsTable/StatsDashboard';
import TestStreamsPage from './components/testStrems/TestStreams';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Main Dashboard with Category Slider and Match Cards */}
          <Route path="/" element={<HomePageUI />} />
          
          {/* Streaming Player Page */}
          <Route path="/watch/:matchId" element={<WatchPage />} />

          <Route path="/live-tv" element={<LiveStreamingPlayer />} />

          <Route path="/details/:matchId" element={<MatchDetail />} />

          <Route path="/player-rating" element={<PlayerRatingView />} />

          <Route path="/stats" element={<StatsDashboard />} />

          {/* <Route path="/test-streams" element={<TestStreamsPage />} /> */}
          
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