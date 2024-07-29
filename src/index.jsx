import React from 'react';
import {createRoot} from 'react-dom/client';
import Main from './main';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css';
import { HashRouter } from 'react-router-dom';
import {configureStore} from '@reduxjs/toolkit';
import rootReducer from './redux/reducers';
import {Provider} from 'react-redux';
 
const store = configureStore({reducer: rootReducer});
const theme = createTheme();

const root = createRoot(document.getElementById('root'))

root.render(
  <Provider store={store}>
    <HashRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />  {/* Include CssBaseline here for global styling */}
        <Main />
      </ThemeProvider>
    </HashRouter>
  </Provider>
)
