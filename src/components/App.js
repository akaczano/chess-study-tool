import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Navbar from './NavBar';

import store from '../store';

import Landing from './Landing';
import Tactics from './Tactics';
import Database from './Database';
import PGNEditor from './editor/PGNEditor';

class App extends React.Component {

  render() {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <Navbar />
          <div style={{backgroundImage: 'linear-gradient(#2193b0, #6dd5ed)', width: '100%', height: '0.6vh'}}></div>
          <div style={{paddingTop: '2.3vh', backgroundColor: '#cccccc', height: '94.4vh'}}>
            <Switch >
              <Route exact path="/" component={Landing} />
              <Route exact path="/tactics" component={Tactics} />
              <Route exact path="/database" render={props => <Database {...props} key="root" />} />
              <Route exact path="/database/:id" render={props => <Database {...props} key={props.match.params.id}/>} />
              <Route exact path="/game/edit/:id" component={PGNEditor} />
              <Route exact path="/game/edit/" component={PGNEditor} />
            </Switch>
          </div>
        </BrowserRouter>
      </Provider>
    );

  }
}

export default App;