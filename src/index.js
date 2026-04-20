import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import App from './renderer/App';
import './index.css';
import { initPostHog, events } from './lib/posthog';

// PostHog 초기화 (앱 시작 시 1회 실행)
initPostHog();
events.appOpened();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);