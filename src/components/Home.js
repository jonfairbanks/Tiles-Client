import React, { Component } from 'react';
import '../styles/App.css';
import { Link } from 'react-router-dom'
import axios from 'axios'
import { RingLoader } from 'react-spinners';
import { Input, Button, Divider, Form, Grid, Segment } from 'semantic-ui-react';

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
          <h1 className="App-title">Tiles</h1>
        </header>
        <Segment placeholder>
          <Grid columns={2} relaxed='very' stackable color={"red"}>
            <Grid.Column>
              <div className="centered-vh">
                <span className="input-group-btn">
                    <Input
                      action={{ color: 'grey', labelPosition: 'right', icon: 'plus', content: 'New Board', onClick: (e)=>this.createNewBoard(), onChange: (e)=>this.handleNameChange(e)}}
                      placeholder='Board Name'
                      onChange={(e)=>this.handleNameChange(e)}
                    />
                </span>
              </div>
            </Grid.Column>
            <Grid.Column verticalAlign='middle'>
              <Form>
                  <Form.Input icon='user' iconPosition='left' label='Username' placeholder='Username' />
                  <Form.Input icon='lock' iconPosition='left' label='Password' type='password' />
                  <Button content='Login' primary />
                </Form>
            </Grid.Column>
          </Grid>

          <Divider vertical>or</Divider>
        </Segment>
        <div id="container">
          {/* LEFT SECTION */}
          <div id="left">
            <h3>Popular Boards</h3>
            {!this.state.data ? (
              <div className="centered">
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
                  <span key={key} >
                    <Link style={{color:"#707070", textAlign: "center", fontSize: "16px"}} to={redirPath}>{board.name}</Link>
                    <br/>
                  </span>
                )
              })
            }
          </div>
          {/* CENTER SECTION */}
          <div id="center">
            <h3>Getting Started</h3>
          </div>

          {/* RIGHT SECTION */}
          <div id="right">
            <h3>Recent Boards</h3>
            {!this.state.data ? (
              <div className="centered">
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
                  <span key={key} >
                    <Link style={{color:"#707070", textAlign: "center", fontSize: "16px"}} to={redirPath}>{board.name}</Link>
                    <br/>
                  </span>
                )
              })
            }
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
