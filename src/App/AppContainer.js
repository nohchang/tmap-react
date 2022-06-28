import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppPresenter from './AppPresenter';

function AppContainer() {

  return (
        <Router>
          <AppPresenter />
        </Router>
  );
}

export default AppContainer;
