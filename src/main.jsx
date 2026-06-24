
// Isolate user sessions between multiple tabs of same domain (e.g. Accounts & Tech Dashboards)
(() => {
  const sessionKeys = [
    'token',
    'userType',
    'userRole',
    'userName',
    'userId',
    'userEmail',
    'department',
    'userPicture'
  ];

  const originalGetItem = localStorage.getItem;
  localStorage.getItem = function (key) {
    if (sessionKeys.includes(key)) {
      const sessionVal = sessionStorage.getItem(key);
      if (sessionVal !== null) return sessionVal;
    }
    return originalGetItem.apply(this, arguments);
  };

  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function (key, value) {
    if (sessionKeys.includes(key)) {
      sessionStorage.setItem(key, value);
    }
    return originalSetItem.apply(this, arguments);
  };

  const originalRemoveItem = localStorage.removeItem;
  localStorage.removeItem = function (key) {
    if (sessionKeys.includes(key)) {
      sessionStorage.removeItem(key);
    }
    return originalRemoveItem.apply(this, arguments);
  };
})();

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from "@material-tailwind/react"

createRoot(document.getElementById('root')).render(
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
)
