import React, { Component } from 'react';
import '../styles/App.css';
import Board from './Board';
import io from "socket.io-client";

const socketUrl = "https://" + process.env.REACT_APP_API;

class App extends Component {

  constructor(props) {
	  super(props);

	  this.state = {
	  	socket:null,
	  };
	}

  componentWillMount() {
		this.initSocket()
	}

  initSocket = ()=>{
		const socket = io(socketUrl)

		socket.on('connect', ()=>{
			console.log("Connected");
		})

		this.setState({socket})
	}

  render() {
    const {socket} = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to Tiles.Bsord.io</h1>
          <p className="App-title">An experiment with React, Socket.Io, MongoDB, and eventually Canvas.</p>
        </header>
        <p className="App-title">Click anywhere in they gray box below to begin 'drawing'. Open this page in another tab side by side with this one to see the effect.</p>

        <Board socket={socket} />

      </div>
    );
  }
}

export default App;
