import React from "react";
import { UserContext } from "../providers/UserProvider";
import {auth, firestore} from "../firebase";
import GameEngine from "../game-engine.js";
import {MaxPlayerCount, MinPlayerCount} from "../game-data.js";

const GameSession = (props) => {
  const gameId = props.gameId;
  const gameData = props.gameData;
  const user = props.user;

  function renderGameWaitingForPlayers(){
    const playersUi = gameData.players.map(player => {
      return (
        <div className='confirmed-player' key={player.uid}>
          <img src={player.img} width='48px' height='48px' /><br />
          Name: {player.name}<br />
          Email: {player.email}
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
    if( !isConfirmedPlayer && gameData.players.length < MaxPlayerCount ){
      actions.push(
        <div className='action join'
          key='action-join'
          onClick={() => props.joinGame(gameId)}>Join</div>
      );
    }
    // [Admin only]
    if( isGameAdmin ){
      // Invite action
      actions.push(
        <div className='action invite'
          key='action-invite'
          onClick={()=>props.invitePlayer(gameId)}>Invite</div>
      );
      // Delete Game
      actions.push(
        <div className='action delete-game'
          key='action-delete'
          onClick={()=>props.deleteGame(gameId)}>Delete</div>
      );
      // If enough players can start
      if( gameData.players.length >= MinPlayerCount && gameData.players.length <= MaxPlayerCount ){
        actions.push(
          <div className='action start-game'
            key='action-start'
            onClick={()=>props.startGame(gameId)}>Start</div>
        );
      }
    }

    return (
      <div className='game'>
        Game Id: {gameId}<br />
        Confirmed Players: <br />
        {playersUi}
        Invited Players: <br />
        {invitedPlayers}
        {actions}
      </div>
    );
  }

  function renderStartedGame(){
    const playersUi = gameData.players.map(player => {
      return (
        <div className='player' key={player.uid}>
          <img src={player.img} width='48px' height='48px' /><br />
          Name: {player.name}<br />
          Email: {player.email}
        </div>
      );
    });

    const actions = [];
    const isGameAdmin = gameData.admin === user.uid;
    const isConfirmedPlayer = gameData.players.find(p => p.uid === user.uid);
    // Play action
    if( isConfirmedPlayer ){
      actions.push(
        <div className='action play'
          key='action-play'
          onClick={() => props.playGame(gameId)}>Play</div>
      );
      // [Admin only]
      if( isGameAdmin ){
        // Delete Game
        actions.push(
          <div className='action delete-game'
            key='action-delete'
            onClick={()=>props.deleteGame(gameId)}>Delete</div>
        );
      }
    }
    return (
      <div className='game'>
        Game Id: {gameId}<br />
        Players: <br />
        {playersUi}
        {actions}
      </div>
    );
  }

  if( gameData.game === null ){
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

  return (
    <div className='game-list'>
      <button onClick={props.createGame}>Create Game</button>
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
        if( user.id !== doc.data().admin ){
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
      alert('Error adding players', error); // TODO
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
      alert("Error deleting the game",error); // TODO
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
      alert('Error joining session', error); // TODO
    });
  }

  createGame(){
    console.log("Create Game");
    const user = this.context;
     firestore.collection('games').add({
       guests: [user.email],
       admin: user.uid,
       players: [{
         uid: user.uid,
         img: user.photoURL,
         name: user.displayName,
         email: user.email,
       }],
       game: null,
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
        if( user.id !== doc.data().admin ){
          throw new Error('Admin only');
        }
        const game = GameEngine.createGame(doc.data().players);
        transaction.update(gameRef,{game: game});
        return game;
      });
    }).then(game => {
      console.log('Game started', game); // TODO
    }).catch(error => {
      alert('Error creating game', error); // TODO
    });
  }

  playGame(gameId){
    // TODO route
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
      <div className="mx-auto w-11/12 md:w-2/4 py-8 px-4 md:px-8">
        <div className="flex border flex-col items-center md:flex-row md:items-start border-blue-400 px-3 py-4">
          <div
            style={{
              background: `url(${photoURL || 'https://res.cloudinary.com/dqcsk8rsc/image/upload/v1577268053/avatar-1-bitmoji_upgwhc.png'})  no-repeat center center`,
              backgroundSize: "cover",
              height: "200px",
              width: "200px"
            }}
            className="border border-blue-300"
          ></div>
          <div className="md:pl-4">
          <h2 className="text-2xl font-semibold">{displayName}</h2>
          <h3 className="italic">{email}</h3>
          </div>
        </div>
        <button className="w-full py-3 bg-red-600 mt-4 text-white" onClick = {() => {auth.signOut()}}>Sign out</button>
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
    )
  }
}

export default ProfilePage;
