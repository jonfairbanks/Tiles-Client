import React, { Component } from 'react';
import '../styles/App.css';
import Board from './Board';
import io from "socket.io-client";

const socketUrl = "https://" + process.env.REACT_APP_API;
console.log(process.env);
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
          <h1 className="App-title">Tiles - Socket.io real time app</h1>
        </header>
        <Board socket={socket} />

      </div>
    );
  }
}

export default App;
