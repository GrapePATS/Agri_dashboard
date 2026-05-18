import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AIPage } from './pages/AIPage';
import { MapPage } from './pages/MapPage';
import { DetectionsPage } from './pages/DetectionsPage';
import { DetectionDetailPage } from './pages/DetectionDetailPage';
import { ReportsPage } from './pages/ReportsPage';
import { TasksPage } from './pages/TasksPage';
import { YieldPage } from './pages/YieldPage';

function AppShell() {
  return (
    // REDESIGN: Panache page background — light green tint from palette
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#e9f6eb] relative">
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ai-summary" element={<AIPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/detections" element={<DetectionsPage />} />
          <Route path="/detections/:id" element={<DetectionDetailPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/yield" element={<YieldPage />} />
          <Route path="/tasks" element={<TasksPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return <AppShell />;
}
