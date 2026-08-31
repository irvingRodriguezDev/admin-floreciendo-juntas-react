import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';

import {
  ThemeProvider as ThemeProviderV5,
  StyledEngineProvider,
} from '@mui/material/styles';

import CssBaseline from '@mui/material/CssBaseline';

import App from './App';
import * as serviceWorker from './serviceWorker';

import { LayoutProvider } from './context/LayoutContext';

import {
  ThemeProvider as ThemeChangeProvider,
  ThemeStateContext,
} from './context/ThemeContext';

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
    <StyledEngineProvider injectFirst>

      <ThemeChangeProvider>

        <ThemeStateContext.Consumer>
          {(theme) => (

            <ThemeProviderV5 theme={theme}>

              <CssBaseline />

              <GoogleReCaptchaProvider
                reCaptchaKey="6LdLB4EsAAAAADKpzUAgDhCAuPNmzbOWIApFVMpT"
              >
                <App />
              </GoogleReCaptchaProvider>

            </ThemeProviderV5>

          )}
        </ThemeStateContext.Consumer>

      </ThemeChangeProvider>

    </StyledEngineProvider>
  </LayoutProvider>
);


// ========================================
// SERVICE WORKER
// ========================================

serviceWorker.unregister();