import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { createStore, applyMiddleware, compose } from 'redux';
import ReduxThunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { routerMiddleware } from 'connected-react-router';
import { ThemeProvider as ThemeProviderV5 } from '@mui/material/styles';
import { StyledEngineProvider } from '@mui/material/styles';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { LayoutProvider } from './context/LayoutContext';
import createRootReducer from './reducers';
import {
  ThemeProvider as ThemeChangeProvider,
  ThemeStateContext,
} from './context/ThemeContext';
import CssBaseline from '@mui/material/CssBaseline';
// import config from '../src/config';

// CAMBIA ESTA PARTE - usa createBrowserHistory en lugar de createHashHistory
import { createBrowserHistory, createMemoryHistory } from 'history';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

const history =
  typeof window !== 'undefined'
    ? createBrowserHistory()  // Cambiado de createHashHistory()
    : createMemoryHistory({
      initialEntries: [],
    });

export function getHistory() {
  return history;
}

// axios.defaults.baseURL = config.baseURLApi;
axios.defaults.headers.common['Content-Type'] = 'application/json';
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
}

export const store = createStore(
  createRootReducer(history),
  compose(applyMiddleware(routerMiddleware(history), ReduxThunk)),
);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
    <LayoutProvider>
      <StyledEngineProvider injectFirst>
        <ThemeChangeProvider>
          <ThemeStateContext.Consumer>
            {(theme) => (
              <ThemeProviderV5 theme={theme}>
                <CssBaseline />
                <GoogleReCaptchaProvider reCaptchaKey='6LdLB4EsAAAAADKpzUAgDhCAuPNmzbOWIApFVMpT'>
                  <App />
                </GoogleReCaptchaProvider>
              </ThemeProviderV5>
            )}
          </ThemeStateContext.Consumer>
        </ThemeChangeProvider>
      </StyledEngineProvider>
    </LayoutProvider>
  </Provider>,
);

serviceWorker.unregister();