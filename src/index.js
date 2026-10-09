import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';

import App from './App';
import * as serviceWorker from './serviceWorker';

import { LayoutProvider } from './context/LayoutContext';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';


// ========================================
// AXIOS
// ========================================

axios.defaults.headers.common['Content-Type'] = 'application/json';

const token = localStorage.getItem('token');

if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}


// ========================================
// REACT
// ========================================

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(
  <LayoutProvider>
    <GoogleReCaptchaProvider
      reCaptchaKey="6LdLB4EsAAAAADKpzUAgDhCAuPNmzbOWIApFVMpT"
    >
      <App />
    </GoogleReCaptchaProvider>
  </LayoutProvider>
);


// ========================================
// SERVICE WORKER
// ========================================

serviceWorker.unregister();