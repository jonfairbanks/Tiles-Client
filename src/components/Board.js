import React, { Component } from "react";
import { CirclePicker } from 'react-color';
import io from "socket.io-client";
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';
import { RingLoader } from 'react-spinners';
import { Icon, Segment, Input, Form, Divider, Header, Label} from 'semantic-ui-react';
import PNGImage from 'pnglib-es6';
import Draggable from 'react-draggable';
import Chance from 'chance';

import '../styles/Board.css';
import '../styles/Chat.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-chat-widget/lib/styles.css';

const nameGetter = new Chance();
const getAName = () => nameGetter.first();

const socketUrl = "https://" + process.env.REACT_APP_API;
  // Constructor for Shape objects to hold data for all drawn objects.
// For now they will just be defined as rectangles.
function Shape(x, y, w, h, fill) {
  // This is a very simple and unsafe constructor. 
  // All we're doing is checking if the values exist.
  // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
  this.x = x || 0;
  this.y = y || 0;
  this.w = w || 1;
  this.h = h || 1;
  this.fill = fill || '#AAAAAA';
}

// Draws this shape to a given context
Shape.prototype.draw = function(ctx) {
  ctx.fillStyle = this.fill;
  ctx.fillRect(this.x, this.y, this.w, this.h);
}

// Determine if a point is inside the shape's bounds
Shape.prototype.contains = function(mx, my) {
  // All we have to do is make sure the Mouse X,Y fall in the area between
  // the shape's X and (X + Width) and its Y and (Y + Height)
  return  (this.x <= mx) && (this.x + this.w >= mx) &&
          (this.y <= my) && (this.y + this.h >= my);
}

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      boardState: false,
      color: '#FFF',
      socket: null,
      boardLog: false,
      userCount: 1,
      visible: false,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      messages: [],
      message: "",
      username: getAName()
    };

    this.draggingPopup = false;
    this.pendingChanges= []
    this.scale = 7;
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

  changeTileColor(e) {
    var scale = this.scale

    var x = Math.ceil(e.clientY / scale) - 1
    var y = Math.ceil(e.clientX / scale) - 1

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
        this.pendingChanges.push(tileUpdateData);
      } else {
        desiredState.tiles[x][y] = color;
        this.pendingChanges.push(tileUpdateData);
      }
    } else {}
  }

  changeTileColorMouseMove(e) {
    const ctx = this.refs.canvas.getContext('2d');
    var scale = this.scale;

    var x = Math.ceil(e.clientY / scale) - 1
    var y = Math.ceil(e.clientX / scale) - 1
    if((e.buttons === 1 || e.buttons === 3) && this.draggingPopup === false){
      var desiredState = {...this.state.boardState}
      var {color} = this.state;
      var tileUpdateData = {}
      tileUpdateData.x = x
      tileUpdateData.y = y
      tileUpdateData.color = color

      var pixel = new Shape(y * this.scale,x * scale,scale,scale, color)
      pixel.draw(ctx)

      this.pendingChanges.push(tileUpdateData);
      e.target.setAttribute("bgColor", color);
      desiredState.tiles[x][y] = color;

      e.stopPropagation();
      e.preventDefault();
    }
  }

  handleMouseUp(e){
    if((e.button === 0) && this.draggingPopup === false){
      const { socket} = this.state;
      socket.emit("updateTiles", this.props.match.params.boardId, this.selectUniqueChanges(this.pendingChanges))
      this.pendingChanges= []
    }
  }

  handleColorPicker = (color) => {
    this.setState({ color: color.hex});

    //this.handleHideClick();
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



  componentWillMount() {
    
		this.initSocket()
  }

  initSocket = ()=>{
		const socket = io(socketUrl,{ // [1] Important as fuck 
      reconnectionDelay: 1000,
      reconnection:true,
      reconnectionAttempts: 10,
      transports: ['websocket'],
      agent: false, // [2] Please don't set this to true
      upgrade: false,
      rejectUnauthorized: false
   })
		socket.on('connect', ()=>{
      
      socket.emit("joinChannel", this.props.match.params.boardId, this.state.username);
      console.log('socket connected')
    })

    socket.on('userJoined', (username) => {
      console.log(username + ' joined the room')

      const UserJoinToast = ({ closeToast }) => (
        <div style={{margin: "10px 10px 10px 10px"}}>
          <Icon inverted style={{float: "left", marginRight: "25px", color: "#36D8B7"}} name='add user' size='large' />
          <span><b>{username} joined the room</b></span>
        </div>
      )

      toast(<UserJoinToast />, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        pauseOnVisibilityChange: false,
        className: 'toast1',
        bodyClassName: "toast1-body",
        progressClassName: 'toast1-progress'
      });

    })

    socket.on('userLeft', (username) => {
      console.log(username + ' left the room')

      const UserJoinToast = ({ closeToast }) => (
        <div style={{margin: "10px 10px 10px 10px"}}>
          <Icon inverted style={{float: "left", marginRight: "25px", color: "#36D8B7"}} name='remove user' size='large' />
          <span><b>{username} left the room</b></span>
        </div>
      )

      toast(<UserJoinToast />, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        pauseOnVisibilityChange: false,
        className: 'toast1',
        bodyClassName: "toast1-body",
        progressClassName: 'toast1-progress'
      });

    })
    
    socket.on("disconnect", () => {
      socket.disconnect()
      this.initSocket()
      console.log('disconnected')
    });
    this.setState({socket})
  }

  componentWillUnmount(){
    const { socket} = this.state;
    socket.disconnect()
  }

  scaleApply(array, factor) {
    const scaled = [];
    for(const row of array) {
      let x = [];
      for(const item of row)
        x.push.apply(x, Array(factor).fill(item));
      scaled.push.apply(scaled, Array(factor).fill(x));
    }
    return scaled;
  }
  
  getBoardPng(tileData, scale){
    if(scale){
      tileData = this.scaleApply(tileData, scale)
    }

    const image = new PNGImage(tileData[0].length, tileData.length,16);
    //columns
    for (var y = 0; y < tileData.length; y++){
      //rows
      for (var x = 0; x < tileData[y].length; x++){
        //set pixel
        image.setPixel(x,y,image.createColor(tileData[y][x]))
      }

    }

    const dataUri = image.getDataURL(); // data:image/png;base64,...
    return dataUri;
    
  }

  download(filename, dataUri) {
    var pom = document.createElement('a');
    pom.setAttribute('href', dataUri);
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
  }
  
  componentDidMount() {

    window.addEventListener('resize', this.updateWindowDimensions());
    // DEFINE SOCKET EVENT LISTENERS
    const { socket} = this.state;
    socket.on("setBoardState", receivedState => {
      
      this.setState({boardState: receivedState,userCount:receivedState.connections, messages: receivedState.messages ? receivedState.messages : [] });
      this.updateCanvas()
      console.log('received initial board state')
      console.log(this.state.boardState.apiHost)
    })

    socket.on("updateTiles", tileUpdateData => {
      var desiredState = {...this.state.boardState}
      for (var i = 0; i < tileUpdateData.length; i++ ){
        desiredState.tiles[tileUpdateData[i].x][tileUpdateData[i].y] = tileUpdateData[i].color 
      }
      this.setState({boardState: desiredState});
      this.updateCanvas()
      console.log('received board update')
    })

    socket.on("message", message => {
      this.setState({messages: [...this.state.messages, message]});
    })

    const Msg1 = ({ closeToast }) => (
      <div style={{margin: "10px 10px 10px 10px"}}>
        <Icon inverted style={{float: "left", marginRight: "25px", color: "#36D8B7"}} name='pencil' size='large' />
        <span><b>Click to begin drawing!</b></span>
      </div>
    )

    const Msg2 = ({ closeToast }) => (
      <div style={{margin: "10px 10px 10px 10px"}}>
        <Icon inverted style={{float: "left", marginRight: "25px", color: "#36D8B7"}} name='paint brush' size='large' />
        <span><b>Right click to change colors!</b></span>
      </div>
    )

    toast(<Msg1 />, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      pauseOnVisibilityChange: false,
      className: 'toast1',
      bodyClassName: "toast1-body",
      progressClassName: 'toast1-progress'
    });

    setTimeout(() => {
      toast(<Msg2 />, {
        position: "top-right",
        autoClose: 5500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        pauseOnVisibilityChange: false,
      });
    }, 11000);

    
  }

  updateWindowDimensions() {
    this.setState({ innerWidth: window.innerWidth, innerHeight: window.innerHeight });

  }

  updateCanvas() {

    const ctx = this.refs.canvas.getContext('2d');
    var canvasData = this.state.boardState.tiles
    var scale = this.scale;

    ctx.canvas.width  = this.state.innerWidth;
    ctx.canvas.height = this.state.innerHeight;

    for(var y = 0; y < canvasData.length; y++){
      for(var x = 0; x < canvasData[0].length; x++){
        var pixel = new Shape(x * this.scale,y * scale,scale,scale, canvasData[y][x])
        pixel.draw(ctx)
      }
    }
  }

  

  render() {
    const { boardState, visible, messages, socket} = this.state;
    return (

      
      boardState ? 

      <div>
        
        <Segment basic inverted style={{padding:'0', margin: '0'}}>
            <div style={{"textAlign":"left", margin: '0', padding: '0'}}>
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
              <canvas style={{display:'block'}} ref="canvas" onMouseUp={(e)=>{this.handleMouseUp(e)}} onMouseDown={(e)=>{ this.changeTileColor(e) }} onMouseMove={(e)=>{ this.changeTileColorMouseMove(e) }} onContextMenu={(e)=>{this.onContextMenu(e)}}/>
            </div>
            
        </Segment>
        {visible ? 
          <Draggable handle=".handle">
            <div style={{position:'absolute', backgroundColor: '#FFF', top: '100px', left: '100px', padding: '1em',maxWidth:'265px', borderRadius: '5px'}} >
              <Header dividing as='h3' className='handle'>Tiles</Header>
              <CirclePicker styles={{boxShadow: '0 0 0 0px rgba(0,0,0,0)'}}
                color={ this.state.color }
                onChangeComplete={ this.handleColorPicker }
              />

              <div style={{background:'white', textAlign:'left', marginTop:'15px'}}>
                <Messages socket={socket} messages={messages} boardId={this.props.match.params.boardId} username={this.state.username}/>
              </div>
              <Divider inverted />
              <Label as='a'>
                <Icon name='share' />
                Share
              </Label>
              <Label as='a' onClick={(e)=>this.download("download.png", this.getBoardPng(boardState.tiles,5))}>
                <Icon name='save' />
                Save
              </Label>
              <Label as='a'>
                <Icon name='flag' />
                Report
              </Label>

            </div>
          </Draggable>
        :null
        }
      </div>

    :
    <div className="centered-vh">
      <RingLoader
        sizeUnit={"px"}
        size={125}
        color={'#36D8B7'}
      />
    </div>
      
      
      
      );
  }
}

class Messages extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      message: ""
    };
  }

  messagesEndRef = React.createRef()

  componentDidMount () {
    this.InitToBottom()
    this.nameInput.focus();
  }

  componentDidUpdate () {
    this.scrollToBottom()
  }

  scrollToBottom = () => {
    this.messagesEndRef.current.scrollIntoView({behavior: "smooth", block: "start"})
  }

  InitToBottom = () => {
    this.messagesEndRef.current.scrollIntoView()
  }

  handleMessageChange(e) {
    this.setState({
        message: e.target.value
    })
  }

  handleMessageSubmit(e) {
    e.preventDefault();
    this.submitMessage()
    this.setState({
        message: ''
    })
  }

  submitMessage(){
    const message = {}
    message.username = this.props.username
    message.text = this.state.message
    if(message.text !== ''){
      this.props.socket.emit("message", this.props.boardId, message)
      this.setState({messages:[...this.state.messages, message]})
    }
    
  }

  render () {
    const { messages } = this.props
    const {message} = this.state

    return (
      <div>
        <div style={{ maxHeight: '175px', overflowX:'hidden', overflowY:'scroll'}}>
          
          {messages.map((message, key) => 
            
            <div key={key}>
              {message.username === this.props.username ?
                <span key={key} style={{display: 'block', float:'right', clear: 'both', marginTop:'.5em'}}>
                  
                  <span style={{backgroundColor:'#36d8b7',padding: '5px', borderRadius: '5px', color: 'white', float:'right',display:'block', clear:'both'}}>{message.text}</span>
                </span>
              :
              <span key={key} style={{display: 'block',marginTop:'.5em', clear: 'both'}}>
                  <span style={{fontSize:'10px', paddingLeft:'5px', margin:'0',display:'block', color: 'gray', lineHeight:'10px'}}>{message.username}</span>
                  <span style={{backgroundColor:'#DDD',display:'block',padding: '5px', borderRadius: '5px', color: 'black'}}>{message.text}</span>
                </span>
              }
            </div>
          )}
          <div ref={this.messagesEndRef}/>
        </div>

        <Form onSubmit={(e)=>this.handleMessageSubmit(e)} style={{marginTop:'10px'}}>
          
          <Input ref={(input) => { this.nameInput = input; }} icon='angle right' placeholder='Send message..'onChange={(e)=>this.handleMessageChange(e)} value={message} style={{display:'flex'}}/>
        </Form>
      </div>
    )
  }
}


export default Board;


