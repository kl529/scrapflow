import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './context/LanguageContext';
import MainWindow from './components/MainWindow';
import CommentWindow from './components/CommentWindow';
import Statistics from './components/Statistics';
import About from './components/About';

function App() {
  const location = useLocation();
  const isCommentWindow = location.pathname === '/comment';

  return (
    <LanguageProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainWindow />} />
          <Route path="/comment" element={<CommentWindow />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/about" element={<About />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </LanguageProvider>
  );
}

export default App;