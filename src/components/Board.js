import React, { Component } from "react";
import '../styles/Board.css';
import { SketchPicker } from 'react-color';
import io from "socket.io-client";
import axios from 'axios'
import Draggable from 'react-draggable'

const socketUrl = "https://" + process.env.REACT_APP_API;

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      boardState: false,
      color: '#FFF',
      pendingChanges: [],
      socket:null,
      boardLog: false,
    };
    this.dragging = false;
  }

  getBoardLog = () => {
    // Get all users from API
    this.setState({fetchingLog: true})
    axios
      .get('https://' + process.env.REACT_APP_API + '/tiles/' + this.props.match.params.boardId + '/log')
      .then(res => {
        this.setState({ data: res.data ? res.data : [], isFetching:false})
        console.log(res.data)
        this.setState({fetchingLog: false})
      })
      .catch(error => {
        console.log(error);
        this.setState({fetchingLog: false})
      })
  }

  componentWillMount() {
		this.initSocket()
  }

  initSocket = ()=>{
		const socket = io(socketUrl)

		socket.on('connect', ()=>{
      console.log("Connected");
      socket.emit("joinChannel", this.props.match.params.boardId);
    })
    
    socket.on("disconnect", () => {
      console.log("Disconnected");
    });

		this.setState({socket})
  }
  componentWillUnmount(){
    const { socket} = this.state;
    socket.disconnect()
  }
  componentDidMount() {
    // DEFINE SOCKET EVENT LISTENERS

    const { socket} = this.state;
   
    socket.on("setBoardState", receivedState => {
      this.setState({boardState: receivedState});
    })

    socket.on("updateTiles", tileUpdateData => {
      var desiredState = {...this.state.boardState}
      for (var i = 0; i < tileUpdateData.length; i++ ){
        desiredState.tiles[tileUpdateData[i].x][tileUpdateData[i].y] = tileUpdateData[i].color 
      }
      this.setState({boardState: desiredState});
    })

	}

  changeTileColor(x,y,e) {
      //do some stuff
      var desiredState = {...this.state.boardState}
      var {color} = this.state;
      var tileUpdateData = {}
      tileUpdateData.x = x
      tileUpdateData.y = y
      tileUpdateData.color = color

      if (desiredState.tiles[x][y] === color){
        desiredState.tiles[x][y] = desiredState.baseColor;
        tileUpdateData.color = desiredState.baseColor
        //this.setState({boardState: desiredState});
        
        this.state.pendingChanges.push(tileUpdateData);
        //socket.emit("updateTile", tileUpdateData)
      } else {
        desiredState.tiles[x][y] = color;
        //this.setState({boardState: desiredState});
        e.target.setAttribute("bgColor", color);
        this.state.pendingChanges.push(tileUpdateData);
        //socket.emit("updateTile", tileUpdateData)
      }
  }

  changeTileColorMouseMove(x,y,e) {
    if((e.buttons === 1 || e.buttons === 3) && this.dragging === false){
      //do some stuff
      var desiredState = {...this.state.boardState}
      var {color} = this.state;
      var tileUpdateData = {}
      tileUpdateData.x = x
      tileUpdateData.y = y
      tileUpdateData.color = color

      this.state.pendingChanges.push(tileUpdateData);
      e.target.setAttribute("bgColor", color);
      desiredState.tiles[x][y] = color;
      //this.setState({boardState: desiredState});

      e.stopPropagation();
      e.preventDefault();
    }
  }

  handleMouseUp(){
    const { socket} = this.state;
    console.log(this.state.pendingChanges);
    socket.emit("updateTiles", this.props.match.params.boardId, this.selectUniqueChanges(this.state.pendingChanges))
    this.setState({pendingChanges: []})
  }

  handleColorPicker = (color) => {
    this.setState({ color: color.hex });
  };

  handleDragStart = () => {
    this.dragging = true;
  }
  handleDragStop = () => {
    this.dragging = false;
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

  render() {
    const { boardState } = this.state;
    return (
      <div >
        {boardState
          ? <div>
              <Draggable
                handle=".handle"
                defaultPosition={{x: 700, y: 600}}
                bounds="parent"
                position={null}
                scale={1}
                onStart={this.handleDragStart}
                onDrag={this.handleDrag}
                onStop={this.handleDragStop}
              >
                <div className="draggable-wrapper">
                  <div className="handle">Move</div>
                  <SketchPicker
                    color={ this.state.color }
                    onChangeComplete={ this.handleColorPicker }
                  />
                </div>

              </Draggable >
              <table className="center">
                <tbody>
                  {boardState.tiles.map((row, i) =>
                    <tr key={i}>
                      {row.map((col, j) =>
                        <td key={j} onMouseMove={(e)=>{ this.changeTileColorMouseMove(i,j,e) }} onMouseDown={(e)=>{ this.changeTileColor(i,j,e) }} onMouseUp={()=>this.handleMouseUp()} bgcolor={col}></td>
                      )}
                    </tr>
                  )}
                </tbody>

              </table>
              
              

              
            </div>
          : <p>Loading...</p>}
      </div>
    );
  }
}
export default Board;
