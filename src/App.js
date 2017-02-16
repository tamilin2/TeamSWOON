import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import logoimage from '/Users/JhanS/Downloads/UCSDaltref.png'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logoimage} className="App-logo" alt="logo" />
        </div>
        
      </div>
    );
  }
}

export default App;
