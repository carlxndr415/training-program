import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import WorkoutsPage from './components/WorkoutsPage';
import TrackingPage from './components/TrackingPage';
import ProgressDashboard from './components/ProgressDashboard';

const LandingPageWrapper = () => {
  const navigate = useNavigate();
  return <LandingPage onNavigate={navigate} />;
};

const WorkoutsPageWrapper = () => {
  const navigate = useNavigate();
  const ModifiedWorkoutsPage = () => {
    const page = <WorkoutsPage onBack={() => navigate('/')} />;
    // Auto-complete first set after 1 second, then show rest
    React.useEffect(() => {
      setTimeout(() => {
        console.log('Auto-completing first set');
        const buttons = document.querySelectorAll('button');
        const completeButton = Array.from(buttons).find(button => 
          button.textContent.includes('Completed')
        );
        if (completeButton) {
          completeButton.click();
          console.log('Complete button clicked');
          // After 1 second, simulate rest
          setTimeout(() => {
            console.log('Simulating rest period');
          }, 1000);
        } else {
          console.log('Complete button not found');
        }
      }, 1000);
    }, []);
    return page;
  };
  return <ModifiedWorkoutsPage />;
};

const TrackingPageWrapper = () => {
  const navigate = useNavigate();
  return <TrackingPage onBack={() => navigate('/')} />;
};

const ProgressDashboardWrapper = () => {
  const navigate = useNavigate();
  return <ProgressDashboard onBackToWorkout={() => navigate('/')} />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WorkoutsPageWrapper />} />
        <Route path="/workouts" element={<WorkoutsPageWrapper />} />
        <Route path="/tracking" element={<TrackingPageWrapper />} />
        <Route path="/dashboard" element={<ProgressDashboardWrapper />} />
      </Routes>
    </Router>
  );
};

export default App;