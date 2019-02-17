import React, { Component } from "react";
import '../styles/Board.css';
import { TwitterPicker } from 'react-color';

class Board extends Component {
  constructor() {
    super();
    this.state = {
      boardState: false,
      color: '#FFF'
    };
  }

  componentDidMount() {
		const { socket} = this.props;
    //use the below to
		//socket.emit("update",  "1");
    socket.on("setBoardState", receivedState => {
      //console.log("boardState received:" + JSON.stringify(receivedState));
      this.setState({boardState: receivedState});
      console.log(receivedState.connections);
    })
	}

  changeTileColor(x,y,e) {
    if(e.buttons === 1 || e.buttons === 3){
      console.log(e);
      //do some stuff
      const { socket} = this.props;
      var desiredState = {...this.state.boardState}
      var {color} = this.state;

      if (desiredState.tiles[x][y] === color){
        desiredState.tiles[x][y] = desiredState.baseColor;
        this.setState({boardState: desiredState});
        socket.emit("updateBoardState",  desiredState);
      } else {
        desiredState.tiles[x][y] = color;
        this.setState({boardState: desiredState});
        socket.emit("updateBoardState",  desiredState);
      }
    }
      

    
  }

  handleColorPicker = (color) => {
    this.setState({ color: color.hex });
  };

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
                        <td key={j} onMouseOver={(e)=>{ this.changeTileColor(i,j,e) }} onMouseDown={(e)=>{ this.changeTileColor(i,j,e) }} bgcolor={col}></td>
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
