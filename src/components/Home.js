import React, { Component } from 'react';
import '../styles/App.css';
import { Link } from 'react-router-dom'
import axios from 'axios'
import { RingLoader } from 'react-spinners';
import { Input } from 'semantic-ui-react';

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
          this.props.history.push('/'+ res.data.boardId);
        } else {
          console.log(res.data)
        }
      })
      .catch(error => {
        console.log(error);
      })
  }

  handleNameChange = (e) => {
    this.setState({newBoardName: e.target})
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
          <h1 className="App-title">Tiles</h1>
        </header>
        <span className="input-group-btn">
          <Input
            inverted
            action={{ color: 'grey', labelPosition: 'right', icon: 'plus', content: 'Create a board' }}
            defaultValue='Board Name'
            onChange={(e)=>this.handleNameChange(e)}
            onClick={(e)=>this.createNewBoard()}
          />
        </span> 
        <ul style={{"listStyle":"none"}}>
          {!this.state.data ? (
            <div class="centered">
              <RingLoader
                sizeUnit={"px"}
                size={25}
                color={'#36D8B7'}
              />
            </div>
          ) : 
            this.state.data.map((board, key) => {
              const redirPath = "/" + board._id
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
