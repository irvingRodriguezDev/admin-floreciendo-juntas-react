import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';

import App from './App';

import { LayoutProvider } from './context/LayoutContext';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';


// ========================================
// AXIOS
// ========================================

axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;


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