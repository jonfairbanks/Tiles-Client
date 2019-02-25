import React, { Component } from 'react';
import '../styles/App.css';
import axios from 'axios'
import { RingLoader } from 'react-spinners';
import { Link } from "react-router-dom";
import { Input, Button, Divider, Form, Grid, Segment, Image } from 'semantic-ui-react';
import PNGImage from 'pnglib-es6';
import StackGrid from "react-stack-grid";
import { css } from '@emotion/core';
import moment from 'moment';
import Filter from 'bad-words';

var filter = new Filter();
filter.addWords('maga'); // Items listed here will be replaced with ****
filter.removeWords('hells'); // Items listed here will NOT be filtered

class Home extends Component {
  constructor() {
    super();
    this.state = {
      isFetching: false,
      error: false
    };
    this.newBoardName = ""
  }
  
  createNewBoard = () => {
    if(filter.isProfane(this.newBoardName)){}else{
      var name = filter.clean(this.newBoardName);
      var color = "#222";
      // Get all users from API
      axios
        .post('https://' + process.env.REACT_APP_API + '/tiles',  {name: name, baseColor: color})
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
  }

  handleNameChange = (e) => {
    if(filter.isProfane(e.target.value)){
      this.setState({error: true});
    }else{
      this.setState({error: false});
    }
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
    const image = new PNGImage(tileData[0].length, tileData.length, 135,16);
    // Columns
    for (var y = 0; y < tileData.length; y++){
      // Rows
      for (var x = 0; x < tileData[y].length; x++){
        // Set pixels
        image.setPixel(x,y,image.createColor(tileData[y][x]))
      }
    }
    const dataUri = image.getDataURL(); // data:image/png;base64,...
    return dataUri;
  }
  
  componentDidMount() {
    this.setState({ isFetching: true });
    this.getAllBoards();
  }

  render() {
    const { error } = this.state;

    var override = css`
      display: block;
      margin: 0 auto;
    `;

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">TILES</h1>
        </header>
        <Segment placeholder>
          <Grid columns={2} relaxed='very' stackable>
            <Grid.Column>
              <div className="centered-vh">
                <span className="input-group-btn">
                    <h2 style={{color:"#707070", textAlign: "center"}}>Get Started</h2>
                    <Input
                      error={error}
                      action={{ color: 'grey', labelPosition: 'right', icon: 'plus', content: 'New Board', onClick: (e)=>this.createNewBoard()} }
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
            <h3 style={{fontSize: "1.5em"}}>Popular Boards</h3>
            {!this.state.data ? (
              <RingLoader
                css={override}
                sizeUnit={"px"}
                size={40}
                color={'#FFF'}
              />
            ) :
              <div style={{height: '500px', overflowX: "hidden"}}>
                <StackGrid columnWidth={250}>
                  {this.state.data.sort((a, b) => {return b.boardLog.length - a.boardLog.length}).slice(0,21).map((board, key) => {
                    const redirPath = "/" + board._id
                    return(
                      <div
                        style={{
                          width: 250,
                          height: 175,
                        }}
                        key={key}
                      >
                        <Link to={redirPath}>
                          <Image
                            src={this.getBoardPng(board.boardData)}
                            alt={"popular-" + board.name}
                            style={{"border":"1px solid #767676"}}
                          />
                        </Link>
                        <b>{board.name}</b><br/>
                        <span style={{color: "#666666"}}>{board.boardLog.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " edits"}</span>
                      </div>
                    )
                  })}
                </StackGrid>
              </div>
            }
          </div>

          {/* RIGHT SECTION */}
          <div id="right">
            <h3 style={{fontSize: "1.5em"}}>Recent Boards</h3>
            {!this.state.data ? (
              <RingLoader
                css={override}
                sizeUnit={"px"}
                size={40}
                color={'#FFF'}
              />
            ) :
              <div style={{height: '500px', overflowX: "hidden"}}>
                <StackGrid columnWidth={250}>
                  {this.state.data.sort((a, b) => {return moment(b.dateCreated) - moment(a.dateCreated)}).slice(0,21).map((board, key) => {
                    var redirPath = "/" + board._id
                    var timeElapsed = moment(board.dateCreated).from(moment());
                    return(
                      <div
                        style={{
                          width: 250,
                          height: 175,
                        }}
                        key={key}
                      >
                        <Link to={redirPath}>
                          <Image
                            src={this.getBoardPng(board.boardData)}
                            alt={"recent-" + board.name}
                            style={{"border":"1px solid #767676"}}
                          />
                        </Link>
                        <b>{board.name}</b><br/>
                        <span style={{color: "#666666"}}>{"Created " + timeElapsed}</span>
                        <br/>
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