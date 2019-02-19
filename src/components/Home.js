import React, { Component } from 'react';
import '../styles/App.css';
import { Link } from 'react-router-dom'
import axios from 'axios'

class Home extends Component {
  constructor() {
    super();
    this.state = {
      isFetching: false,
      newBoardName: "",
    };
  }
  createNewBoard = () => {
    // Get all users from API
    axios
      .post('https://' + process.env.REACT_APP_API + '/tiles',  {name: this.state.newBoardName, baseColor:"#222"})
      .then(res => {
        if(res.data.success){
          this.props.history.push('/board/'+ res.data.boardId);
        } else {
          console.log(res.data)
        }
        
      })
      .catch(error => {
        console.log(error);
      })
  }
  handleNameChange = (e) => {
    this.setState({newBoardName: e.target.value})
  }
  getAllBoards = () => {
    // Get all users from API
    axios
      .get('https://' + process.env.REACT_APP_API + '/tiles')
      .then(res => {
        this.setState({ data: res.data ? res.data : [], isFetching:false})
      })
      .catch(error => {
        console.log(error);
      })
  }

  componentDidMount() {
    this.setState({ isFetching: true });
		this.getAllBoards();
  }

  render() {
    return (
      <div className="App">
      <header className="App-header">
          <h1 className="App-title">Tiles - Socket.io real time app</h1>
        </header>
        <p>Home page</p>
        <span className="input-group-btn">
          <label>New Board Name:</label><input onChange={(e)=>this.handleNameChange(e)}></input>
          <button onClick={(e)=>this.createNewBoard()}>Create new board</button>
        </span> 
        <ul>
          {!this.state.data ? (<p>Loading boards.. </p>) : 
            this.state.data.map((board, key) => {
              const redirPath = "/board/" + board._id
              return(
                <li key={key} >
                  <Link to={redirPath}>{board.name}</Link>
                </li>
              )
            })
          }
        </ul>
      </div>
    );
  }
}

export default Home;
