import React from 'react';
import { Provider, useSelector } from 'react-redux';

import Navbar from './NavBar';
import store from '../store';


import Landing from './Landing';
import Database from './Database';
import PGNEditor from './editor/PGNEditor';

import { LANDING, DATABASE, EDITOR, STUDY, QUIZ } from '../state/navSlice'
import StudyLanding from './study/StudyLanding';
import Quiz from './study/Quiz'

function NavControl() {  
  const { location } = useSelector(state => state.nav)  
  if (location === LANDING) {
    return <Landing />
  }
  else if (location === DATABASE) {
    return <Database />
  }
  else if (location === EDITOR) {
    return <PGNEditor />
  }
  else if (location === STUDY) {
    return <StudyLanding />
  }
  else if (location === QUIZ) {
    return <Quiz />
  }
}


class App extends React.Component {

  render() {
    return (
      <Provider store={store}>

        <Navbar />
        <div style={{ backgroundImage: 'linear-gradient(to right, #4E65FF, #92EFFD)', width: '100%', height: '0.6vh' }}></div>
        <div style={{ backgroundColor: '#e6e6e6', paddingTop: '2.3vh', height: '94.4vh' }}>
          <NavControl />
        </div>
      </Provider>
    );

  }
}

export default App;