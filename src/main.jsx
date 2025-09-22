// In src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import App from './App';
import './index.css';
import { store } from './redux/app/store';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Toaster position="top-right" /> {/* ✅ Add this line */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);