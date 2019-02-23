import React, { Component } from "react";
import { CompactPicker } from 'react-color';
import io from "socket.io-client";
import axios from 'axios'
import { Link } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import { RingLoader } from 'react-spinners';
import { Icon, Menu, Segment, Sidebar } from 'semantic-ui-react';
import { Widget, addResponseMessage } from 'react-chat-widget';

import '../styles/Board.css';
import '../styles/Chat.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-chat-widget/lib/styles.css';

const socketUrl = "https://" + process.env.REACT_APP_API;

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      boardState: false,
      color: '#FFF',
      socket:null,
      boardLog: false,
      userCount: 1,
      visible: false
    };
    this.draggingPopup = false;
    this.pendingChanges= []
  }

  handleHideClick = () => this.setState({ visible: false })
  handleShowClick = () => this.setState({ visible: true })

  getBoardLog = () => {
    // Get all users from API
    this.setState({fetchingLog: true})
    axios
      .get('https://' + process.env.REACT_APP_API + '/tiles/' + this.props.match.params.boardId + '/log')
      .then(res => {
        this.setState({ data: res.data ? res.data : [], isFetching:false})
        this.setState({fetchingLog: false})
      })
      .catch(error => {
        this.setState({fetchingLog: false})
      })
  }

  changeTileColor(x,y,e) {
    if((e.buttons === 1 || e.buttons === 3) && this.draggingPopup === false){
      var desiredState = {...this.state.boardState}
      var {color} = this.state;
      var tileUpdateData = {}
      tileUpdateData.x = x
      tileUpdateData.y = y
      tileUpdateData.color = color
      if (desiredState.tiles[x][y] === color){
        desiredState.tiles[x][y] = desiredState.baseColor;
        tileUpdateData.color = desiredState.baseColor
        e.target.setAttribute("bgColor", desiredState.baseColor);
        this.pendingChanges.push(tileUpdateData);
      } else {
        desiredState.tiles[x][y] = color;
        e.target.setAttribute("bgColor", color);
        this.pendingChanges.push(tileUpdateData);
      }
    } else {}
  }

  changeTileColorMouseMove(x,y,e) {
    if((e.buttons === 1 || e.buttons === 3) && this.draggingPopup === false){
      var desiredState = {...this.state.boardState}
      var {color} = this.state;
      var tileUpdateData = {}
      tileUpdateData.x = x
      tileUpdateData.y = y
      tileUpdateData.color = color

      this.pendingChanges.push(tileUpdateData);
      e.target.setAttribute("bgColor", color);
      desiredState.tiles[x][y] = color;

      e.stopPropagation();
      e.preventDefault();
    }
  }

  handleMouseUp(e){
    if((e.buttons === 1 || e.buttons === 3) && this.draggingPopup === false){
      const { socket} = this.state;
      socket.emit("updateTiles", this.props.match.params.boardId, this.selectUniqueChanges(this.pendingChanges))
      this.pendingChanges= []
    }
  }

  handleColorPicker = (color) => {
    this.setState({ color: color.hex});
    this.handleHideClick();
  };

  onContextMenu = (e) => {
    if(this.state.visible === false) {
      this.handleShowClick();
      e.preventDefault();
    }
    
    if(this.state.visible === true) {
      this.handleHideClick();
      e.preventDefault();
    }
  }

  selectUniqueChanges(arr) {
    var uniques = [];
    var itemsFound = {};
    for(var i = 0, l = arr.length; i < l; i++) {
        var stringified = JSON.stringify(arr[i]);
        if(itemsFound[stringified]) { continue; }
        uniques.push(arr[i]);
        itemsFound[stringified] = true;
    }
    return uniques;
  }

  handleNewUserMessage = (newMessage) => {
    console.log(`New message incoming! ${newMessage}`);
    // Now send the message throught the backend API
    addResponseMessage(newMessage);
  }

  componentWillMount() {
		this.initSocket()
  }

  initSocket = ()=>{
		const socket = io(socketUrl)
		socket.on('connect', ()=>{
      socket.emit("joinChannel", this.props.match.params.boardId);
    })

    socket.on('updateConnections', newConnectionCount => {
      this.setState({userCount: newConnectionCount})
    })
    
    socket.on("disconnect", () => {
      this.initSocket()
    });
		this.setState({socket})
  }

  componentWillUnmount(){
    const { socket} = this.state;
    socket.disconnect()
  }

  componentDidMount() {
    addResponseMessage("Welcome to Tiles!");
    // DEFINE SOCKET EVENT LISTENERS
    const { socket} = this.state;
    socket.on("setBoardState", receivedState => {
      this.setState({boardState: receivedState,userCount:receivedState.connections});
    })
    toast('✏️ Click to begin drawing!', {
      position: "bottom-right",
      autoClose: 5500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      type: toast.TYPE.SUCCESS
    });

    setTimeout(() => {
      toast('🌈 Right click to change colors!', {
        position: "bottom-right",
        autoClose: 5500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        type: toast.TYPE.INFO
      });
    }, 12000);
	}

  render() {
    const { boardState, visible } = this.state;
    return (
      <Sidebar.Pushable as={Segment}>

        {/* LEFT SIDEBAR */}
        <Sidebar
          as={Menu}
          animation='push'
          direction='bottom'
          icon='labeled'
          inverted
          visible={visible}
          width='wide'
        >
          <Menu.Item as='a' href='/'>
            <h1 style={{color: "#36D8B7"}} className="App-title">Tiles</h1>
          </Menu.Item>
          <Menu.Item as='a'>
            <Icon inverted style={{color: "#36D8B7"}} name='wrench' size='tiny' />
            Tools
          </Menu.Item>
          <Menu.Item as='a'>
            <Icon inverted style={{color: "#36D8B7"}} name='share' size='tiny' />
            Share
          </Menu.Item>
          <Menu.Item as='a'>
            <Icon inverted style={{color: "#36D8B7"}} name='users' size='tiny' />
            {this.state.userCount + " User(s)"}
          </Menu.Item>
          <div className="centered" style={{margin: "12px 0"}}>
            <CompactPicker
              color={ this.state.color }
              onChangeComplete={ this.handleColorPicker }
            />
          </div>
          <Widget
            handleNewUserMessage={this.handleNewUserMessage}
            profileAvatar="https://picsum.photos/100/100/?random"
          />
        </Sidebar>

        {/* MAIN CONTENT */}
        <Sidebar.Pusher>
          <Segment basic inverted style={{"padding":"0 0 0 0"}}>
            {boardState
            ? 
              <div style={{"textAlign":"left"}}>
                <ToastContainer
                  position="top-right"
                  autoClose={10000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnVisibilityChange={false}
                  draggable
                  pauseOnHover
                />
                <ToastContainer />
                <table className="center">
                  <tbody>
                    {boardState.tiles.map((row, i) =>
                      <tr key={i}>
                        {row.map((col, j) =>
                          <td key={j} onMouseMove={(e)=>{ this.changeTileColorMouseMove(i,j,e) }} onMouseDown={(e)=>{ this.changeTileColor(i,j,e) }} onMouseUp={(e)=>this.handleMouseUp(e)} onContextMenu={(e)=>{this.onContextMenu(e)}}bgcolor={col}></td>
                        )}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            :
              <div className="centered-vh">
                <RingLoader
                  sizeUnit={"px"}
                  size={125}
                  color={'#36D8B7'}
                />
              </div>
          }
          </Segment>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    );
  }
}
export default Board;
