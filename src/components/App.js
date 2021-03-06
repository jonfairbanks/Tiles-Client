import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import '../styles/App.css';
import Home from './Home';
import Board from './Board';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <div>
            <Route exact path="/" component={Home} />
            <Route path="/:boardId" {...this.props} component={Board} />
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
