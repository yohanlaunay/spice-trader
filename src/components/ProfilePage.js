import React from "react";
import {navigate} from "@reach/router";
import { UserContext } from "../providers/UserProvider";
import {auth, firestore} from "../firebase";
import Games from "../games/games.js";
import './profile.css';

const DEFAULT_GAME_TYPE = 'spicetrader'; // TODO

const shuffleArray = (arr) => {
  let temp = [...arr];
  let shuffled = [];
  for (let i = 0; i < arr.length; i++) {
    let j = Math.floor(Math.random() * temp.length)
    shuffled.push(temp[j]);
    temp.splice(j, 1);
  }
  return shuffled;
}

const GameSession = (props) => {
  const gameId = props.gameId;
  const gameData = props.gameData;
  const user = props.user;
  const gameInfo = Games[gameData.gameType] || DEFAULT_GAME_TYPE;

  function renderGameWaitingForPlayers(){
    const playersUi = gameData.players.map(player => {
      return (
        <div className='confirmed-player' key={player.uid}>
          <img alt='player' src={player.img} width='48px' height='48px' title={player.email} />
          <span>{player.name}</span>
        </div>
      );
    });
    const invitedPlayers = [];
    gameData.guests.forEach(guest =>{
      if( !gameData.players.find(p=>p.email === guest)
        && guest !== user.email ){
        invitedPlayers.push(
          <div key={guest} className='guest'>
            {guest}
          </div>
        );
      }
    });

    const actions = [];
    const isGameAdmin = gameData.admin === user.uid;
    const isConfirmedPlayer = gameData.players.find(p => p.uid === user.uid);
    // Join action
    if( !isConfirmedPlayer && gameData.players.length < gameInfo.maxPlayerCount ){
      actions.push(
        <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          key='action-join'
          onClick={() => props.joinGame(gameId)}>Join</button>
      );
    }
    // [Admin only]
    if( isGameAdmin ){
      // Invite action
      actions.push(
        <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          key='action-invite'
          onClick={()=>props.invitePlayer(gameId)}>Invite</button>
      );
      // Delete Game
      actions.push(
        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          key='action-delete'
          onClick={()=>props.deleteGame(gameId)}>Delete</button>
      );
      // If enough players can start
      if( gameData.players.length >= gameInfo.minPlayerCount && gameData.players.length <= gameInfo.maxPlayerCount ){
        actions.push(
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            key='action-start'
            onClick={()=>props.startGame(gameId)}>Start</button>
        );
      }
    }

    return (
      <div className='game'>
        <div className='game-info'>
          <div className='game-name'>
            <h1>{gameInfo.name}</h1>
            <div className='game-actions'>
              {actions}
            </div>
          </div>
          <b>Players Count:</b> {gameInfo.minPlayerCount} - {gameInfo.maxPlayerCount}<br />
          <b>Duration:</b> {gameInfo.duration}
        </div>
        <div className='game-players'>
          <h1>Players</h1>
          {playersUi}
        </div>
        <div className='game-guests'>
          <h1>Invited Players</h1>
          {invitedPlayers}
        </div>
      </div>
    );
  }

  function renderStartedGame(){
    const playersUi = gameData.players.map(player => {
      return (
        <div className='confirmed-player' key={player.uid}>
          <img alt='player' src={player.img} width='48px' height='48px' title={player.email} /><br />
          <span>{player.name}</span>
        </div>
      );
    });

    const actions = [];
    const isGameAdmin = gameData.admin === user.uid;
    const isConfirmedPlayer = gameData.players.find(p => p.uid === user.uid);
    // Play action
    if( isConfirmedPlayer ){
      if( ! gameData.session.completed ){
        actions.push(
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            key='action-play'
            onClick={() => props.playGame(gameId, gameData.gameType)}>Play</button>
        );
      }
      // [Admin only]
      if( isGameAdmin ){
        if( gameData.session.completed === true ){
          actions.push(
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              key='action-start'
              onClick={() => props.startGame(gameId)}>Restart</button>
          );
        }
        // Delete Game
        actions.push(
          <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            key='action-delete'
            onClick={()=>props.deleteGame(gameId)}>Delete</button>
        );
      }
    }
    return (
      <div className='game'>
        <div className='game-info'>
          <div className='game-name'>
            <h1>{gameInfo.name}</h1>
            <div className='game-actions'>
              {actions}
            </div>
          </div>
        </div>
        <div className='game-players'>
          {playersUi}
        </div>
      </div>
    );
  }

  if( gameData.session === null ){
    return renderGameWaitingForPlayers();
  }
  return renderStartedGame();
};

const GameSessionList = (props) => {
  const gameList = props.value;

  if( gameList.loading ){
    return (
      <div className='game-list'>
        Loading...
      </div>
    );
  }

  const games = Object.entries(gameList.games).map(data => {
    const gameId = data[0];
    const gameData = data[1];
    return (
      <GameSession
        key={gameId}
        user={props.user}
        gameId={gameId}
        gameData={gameData}
        joinGame={props.joinGame}
        startGame={props.startGame}
        invitePlayer={props.invitePlayer}
        deleteGame={props.deleteGame}
        playGame={props.playGame}
      />
    );
  });

  const selectedGameType = DEFAULT_GAME_TYPE; // TODO

  return (
    <div className='game-list'>
      <button className="w-full py-3 bg-blue-500 hover:bg-blue-700 mt-4 text-white px-4 rounded"
          onClick={() => props.createGame(selectedGameType)}>Create Game</button>
      {games}
    </div>
  );
}

class ProfilePage extends React.Component {

  static contextType = UserContext;

  constructor(props){
    super(props);

    this.invitePlayer = this.invitePlayer.bind(this);
    this.deleteGame = this.deleteGame.bind(this);
    this.joinGame = this.joinGame.bind(this);
    this.startGame = this.startGame.bind(this);
    this.createGame = this.createGame.bind(this);
    this.playGame = this.playGame.bind(this);

    this.state = {
      gameList: {
        loading: true,
      },
    };
  }

  invitePlayer(gameId){
    const user = this.context;
    let email = prompt("Enter player email","")
    if( email === null ){
      return;
    }
    email = email.trim().toLowerCase();
    if( ! email.includes('@') ){
      return;
    }

    console.log("Inviting: ",email);
    // TODO update state "inviting"
    const gameRef = firestore.collection('games').doc(gameId);
    firestore.runTransaction(transaction => {
      return transaction.get(gameRef).then(doc => {
        if( ! doc.exists ){
          throw new Error('Game deleted');
        }
        if( user.uid !== doc.data().admin ){
          throw new Error('Admin only');
        }
        if( doc.data().guests.includes(email) ){
          return doc.data().guests;
        }
        const newGuests = [email].concat(doc.data().guests);
        transaction.update(gameRef,{guests: newGuests});
        return newGuests;
      });
    }).then(newGuests=>{
      console.log('Invite successful', newGuests); // TODO
    }).catch(error => {
      alert('Error adding player:'+error); // TODO
    });
  }

  deleteGame(gameId){
    if( window.confirm('Are you sure you want to delete the game?') !== true ){
      return;
    }
    // TODO update state "deleting"
    // Don't need admin check it's managed by firestore rules
    firestore.collection('games').doc(gameId).delete()
    .then(()=>{
      console.log("Delete successful");
    }).catch(error => {
      alert("Error deleting the game:"+error); // TODO
    });
  }

  joinGame(gameId){
    // TODO update state "joining"
    const user = this.context;
    const gameRef = firestore.collection('games').doc(gameId);
    firestore.runTransaction(transaction => {
      return transaction.get(gameRef).then(doc => {
        if( ! doc.exists ){
          throw new Error('Game deleted');
        }
        if( doc.data().players.find(p => p.uid === user.uid) ){
          return doc.data().players;
        }
        const newPlayers = [{
            uid: user.uid,
            img: user.photoURL,
            name: user.displayName,
            email: user.email,
          }].concat(doc.data().players);
        transaction.update(gameRef,{players: newPlayers});
        return newPlayers;
      });
    }).then(newPlayers=>{
      console.log('Join successful', newPlayers); // TODO
    }).catch(error => {
      alert('Error joining session:'+error); // TODO
    });
  }

  createGame(gameType){
    gameType = gameType || DEFAULT_GAME_TYPE; // TODO
    console.log("Create Game "+gameType);
    const user = this.context;
     firestore.collection('games').add({
       guests: [user.email],
       admin: user.uid,
       gameType: gameType,
       created: Date.now(),
       players: [{
         uid: user.uid,
         img: user.photoURL,
         name: user.displayName,
         email: user.email,
       }],
       session: null,
     }).then((docRef) => {
       console.log("New Game created with id:", docRef.id);
     }).catch((error) => {
       console.log("Error creating game:",error);
     });
  }

  startGame(gameId){
    const user = this.context;
    const gameRef = firestore.collection('games').doc(gameId);
    firestore.runTransaction(transaction => {
      return transaction.get(gameRef).then(doc => {
        if( ! doc.exists ){
          throw new Error('Game deleted');
        }
        if( user.uid !== doc.data().admin ){
          throw new Error('Admin only');
        }
        const gameType = doc.data().gameType;
        const players = shuffleArray(doc.data().players);
        const gameSession = Games[gameType].createGameSession(players);
        transaction.update(gameRef,{session: gameSession});
        return true;
      });
    }).then(ignore => {
      console.log('Game started'); // TODO state change
    }).catch(error => {
      alert('Error creating game:'+error); // TODO
    });
  }

  playGame(gameId, gameType){
    return navigate(`/game/${gameType}/${gameId}`);
  }

  componentDidMount() {
    const user = this.context;
    const {email} = user;
    // Subscribe to games list
    firestore.collection('games').where(
      "guests", "array-contains", email
    ).onSnapshot(snapshot => {
        const games = {};
        snapshot.forEach(doc => games[doc.id] = doc.data());
        this.setState({
          gameList: {
            loading: false,
            games: games,
          }
        });
    });
  }

  render(){
    const user = this.context;
    const {photoURL, displayName, email} = user;
    return (
      <div id='profile-page'>
        <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet" />
        <div className="mx-auto w-11/12 md:w-2/4 py-8 px-4 md:px-8">
          <div className="flex border flex-col items-center md:flex-row md:items-start border-blue-400 px-3 py-4">
            <div
              style={{
                background: `url(${photoURL || 'https://res.cloudinary.com/dqcsk8rsc/image/upload/v1577268053/avatar-1-bitmoji_upgwhc.png'})  no-repeat center center`,
                backgroundSize: "cover",
                height: "100px",
                width: "100px"
              }}
              className="border border-blue-300"
            ></div>
            <div className="md:pl-4">
            <h2 className="text-2xl font-semibold">{displayName}</h2>
            <h3 className="italic">{email}</h3>
            <button className="bg-red-500 hover:bg-red-600 w-full py-2 text-white px-4 rounded"
                  onClick={() => {auth.signOut()}}>Sign out</button>
            </div>
          </div>
          <GameSessionList
            user={user}
            value={this.state.gameList}
            joinGame={this.joinGame}
            startGame={this.startGame}
            invitePlayer={this.invitePlayer}
            deleteGame={this.deleteGame}
            createGame={this.createGame}
            playGame={this.playGame}
          />
        </div>
      </div>
    )
  }
}

export default ProfilePage;
