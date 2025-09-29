import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ResumeUpload from './components/ResumeUpload';
import QuestionList from './components/QuestionList';
import QuestionEdit from './components/QuestionEdit';
import ScriptControls from './components/ScriptControls';
import IntroductionSidebar from './components/IntroductionSidebar';
import { Toaster } from './components/ui/toaster';
import useQuestionsStore from './store/questionsStore';

function AppContent() {
  const error = useQuestionsStore(state => state.error);
  const location = useLocation();
  const isEditPage = location.pathname.startsWith('/edit/');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-900 to-purple-700 bg-clip-text text-transparent mb-4">
            Candidate Interview Script Designer
          </h1>
          <p className="text-xl text-purple-700 max-w-2xl mx-auto leading-relaxed">
            Upload a resume to instantly generate a tailored interview script with AI-powered precision
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Content */}
          <div className="flex-1 w-full space-y-8">
            {/* Upload Section - Only show on main page */}
            {!isEditPage && <ResumeUpload />}

            {/* Error Display - Only show on main page */}
            {!isEditPage && error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-800 font-semibold">An error occurred: {error}</p>
              </div>
            )}

            {/* Routes */}
            <Routes>
              <Route path="/" element={<QuestionList />} />
              <Route path="/edit/:questionId" element={<QuestionEdit />} />
            </Routes>

            {/* Footer Controls - Only show on main page */}
            {!isEditPage && <ScriptControls />}
          </div>

          {/* Sidebar - Only show on main page */}
          {!isEditPage && (
            <aside className="w-full lg:w-80 flex-shrink-0">
              <div className="sticky top-8">
                <IntroductionSidebar />
              </div>
            </aside>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
