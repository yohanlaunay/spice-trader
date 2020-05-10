import React from 'react';
import ReactDOM from 'react-dom';
import Game from './game.js';
import GameEngine from './game-engine.js';
import firebase from './config.js';
// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import "firebase/auth";
import "firebase/firestore";

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      gameId: 'dev', // TODO
    }
    // TODO do this when button "create game" is pressed
    let gameData = null;
    if( gameData === null ){
      // create a new game
      gameData = {
        game: GameEngine.createGame(['yohan','claire','weesiong']),
        turn: 0,
        error: null,
        history: [],
        selectedUids: {},
        currentAction: null,
        currentActionData: null,
        lastTurnStartingPlayer: null,
      };
      //firebase.push('games/'+gameId, )
    }
  }

  subscribeToFirebaseState(){
    // collection.add(); // start new game
    let gameData = firebase.firestore()
      .collection('games')
      .doc(this.state.gameId)
      .onSnapshot((doc) => {
        const state = doc.data();
        console.log("NEW DATA",state); // TODO
        // this.setState(state);
      });
  }

  componentDidMount() {
    this.subscribeToFirebaseState();
  }

  render(){
    if( !this.state.game ){
      return (
          <div>LOADING GAME...</div>
      );
    }
    return (
        <div>GAME!</div>
    );
  }
}

// ========================================

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
