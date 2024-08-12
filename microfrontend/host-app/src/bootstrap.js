// src/bootstrap.js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import { BrowserRouter } from "react-router-dom";

import './vendor/normalize.css';
import './vendor/fonts.css';
import './blocks/page/page.css';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
