import React, { Component } from 'react';
import '../styles/App.css';
import axios from 'axios'
import { RingLoader } from 'react-spinners';
import { Link } from "react-router-dom";
import { Input, Button, Divider, Form, Grid, Segment, Image } from 'semantic-ui-react';
import PNGImage from 'pnglib-es6';
import StackGrid from "react-stack-grid";
import { css } from '@emotion/core';

class Home extends Component {
  constructor() {
    super();
    this.state = {
      isFetching: false,
    };
    this.newBoardName = ""
  }
  
  createNewBoard = () => {
    // Get all users from API
    axios
      .post('https://' + process.env.REACT_APP_API + '/tiles',  {name: this.newBoardName, baseColor:"#222"})
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
    this.newBoardName = e.target.value
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

  getBoardPng(tileData){
    const image = new PNGImage(275, 135,16);
    for (var x = 0; x < tileData.length; x++){
      for (var y = 0; y < tileData[x].length; y++){
        image.setPixel(y,x,image.createColor(tileData[x][y]))
      }
    }
    const dataUri = image.getDataURL(); // data:image/png;base64,...
    return dataUri;
  }

  render() {
    var override = css`
      display: block;
      margin: 0 auto;
    `;

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Tiles</h1>
        </header>
        <Segment placeholder>
          <Grid columns={2} relaxed='very' stackable>
            <Grid.Column>
              <div className="centered-vh">
                <span className="input-group-btn">
                    <h2 style={{color:"#707070", textAlign: "center"}}>Get Started</h2>
                    <Input
                      action={{ color: 'grey', labelPosition: 'right', icon: 'plus', content: 'New Board', onClick: (e)=>this.createNewBoard()}}
                      placeholder='Board Name'
                      onChange={(e)=>this.handleNameChange(e)}
                    />
                    <ul style={{color:"#707070", textAlign: "left"}}>
                      <li>Create yourself a board</li>
                      <li>Share the link with your friends</li>
                      <li>Start drawing!</li>
                    </ul>
                </span>
              </div>
            </Grid.Column>
            <Grid.Column>
              <Form>
                <div className="centered-vh">
                  <h2 style={{color:"#707070", textAlign: "center"}}>MyTiles</h2>
                  <div style={{float: "left", paddingRight: "15px"}}>
                    <Form.Input icon='user' iconPosition='left' label='Username' placeholder='Username' />
                  </div>
                  <div style={{float: "left", paddingRight: "15px", paddingBottom: "15px"}}>
                    <Form.Input icon='lock' iconPosition='left' label='Password' placeholder='Password' type='password' />
                  </div>
                  <br/>
                  <div>
                    <Button.Group>
                      <Button color="grey">Login</Button>
                      <Button.Or />
                      <Button>Register</Button>
                    </Button.Group>
                  </div>
                </div>
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
              <RingLoader
                css={override}
                sizeUnit={"px"}
                size={40}
                color={'#36D8B7'}
              />
            ) :
              <div style={{height: '500px', overflowX: "hidden"}}>
                <StackGrid columnWidth={250}>
                  {this.state.data.map((board, key) => {
                    const redirPath = "/" + board._id
                    return(
                      <div
                        style={{
                          width: 250,
                          height: 125,
                        }}
                      >
                        <Link to={redirPath} key={key}>
                          <Image
                            src={this.getBoardPng(board.boardData)}
                            alt={"popular-" + board.name}
                            style={{"border":"1px solid #767676"}}
                            monitorImagesLoaded={true}
                          />
                        </Link>
                      </div>
                    )
                  })}
                </StackGrid>
              </div>
            }
          </div>

          {/* RIGHT SECTION */}
          <div id="right">
            <h3>Recent Boards</h3>
            {!this.state.data ? (
              <RingLoader
                css={override}
                sizeUnit={"px"}
                size={40}
                color={'#36D8B7'}
              />
            ) :
              <div style={{height: '500px', overflowX: "hidden"}}>
                <StackGrid columnWidth={250}>
                  {this.state.data.slice(0).reverse().map((board, key) => {
                    const redirPath = "/" + board._id
                    return(
                      <div
                        style={{
                          width: 250,
                          height: 125,
                        }}
                      >
                        <Link to={redirPath} key={key}>
                          <Image
                            src={this.getBoardPng(board.boardData)}
                            alt={"recent-" + board.name}
                            style={{"border":"1px solid #767676"}}
                            monitorImagesLoaded="true"
                          />
                        </Link>
                      </div>
                    )
                  })}
                </StackGrid>
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default Home;