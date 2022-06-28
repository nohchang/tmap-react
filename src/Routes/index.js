import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { AlamdaMap } from './Pages';

const Routes = () => {
    
    return (
      <Switch>
        <Route exact path="/" component={AlamdaMap} />
        <Route render={() => <div className='error'>에러 페이지</div>} />
      </Switch>
    );
  };
  
  export default Routes