import React, { Component } from "react";
import '../styles/Board.css';
import { TwitterPicker } from 'react-color';

class Board extends Component {
  constructor() {
    super();
    this.state = {
      boardState: false,
      color: '#FFF',
      pendingChanges: []
    };
  }

  componentDidMount() {
    // DEFINE SOCKET EVENT LISTENERS

    const { socket} = this.props;
   
    socket.on("setBoardState", receivedState => {
      this.setState({boardState: receivedState});
      console.log(receivedState.connections);
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
        this.state.pendingChanges.push(tileUpdateData);
        //socket.emit("updateTile", tileUpdateData)
      }
  }

  changeTileColorMouseMove(x,y,e) {
    if(e.buttons === 1 || e.buttons === 3){
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
    const { socket} = this.props;
    console.log(this.state.pendingChanges);
    socket.emit("updateTiles", this.selectUniqueChanges(this.state.pendingChanges))
    this.setState({pendingChanges: []})
  }

  handleColorPicker = (color) => {
    this.setState({ color: color.hex });
  };

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
      <div style={{ textAlign: "center" }}>
        {boardState
          ? <div className="center">
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
              <TwitterPicker
                color={ this.state.color }
                onChangeComplete={ this.handleColorPicker }
              />

            </div>
          : <p>Loading...</p>}
      </div>
    );
  }
}
export default Board;
