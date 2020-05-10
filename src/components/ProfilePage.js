import React from "react";
import { UserContext } from "../providers/UserProvider";
import {auth, firestore} from "../firebase";
import GameEngine from "../game-engine.js";
import {MaxPlayerCount, MinPlayerCount} from "../game-data.js";

const GameSessionStatus = {
  WAITING_FOR_PLAYERS: 'WAITING_FOR_PLAYERS',
  STARTED: 'STARTED',
};

const GameSession = (props) => {
  const gameId = props.gameId;
  const gameData = props.gameData;
  const user = props.user;

  function renderGameWaitingForPlayers(){
    let playersUi = gameData.players.forEach(player => {
      return (
        <div className='player' key={player.uid}>
          <img src={player.img} width='48px' height='48px' /><br />
          Name: {player.name}<br />
          Email: {player.email}
        </div>
      );
    });
    let invitedPlayers = [];
    gameData.owners.forEach(owner =>{
      if( !gameData.players.find(p=>p.email === owner) ){
        invitedPlayers.push(
          <div key={owner}>
            {owner}
          </div>
        );
      }
    });

    const actions = [];
    const isConfirmedPlayer = gameData.players.find(p => p.uid === user.uid);
    // Join action
    if( !isConfirmedPlayer && gameData.players.length < MaxPlayerCount ){
      actions.push(
        <div className='join-game'
          key='action-join'
          onClick={() => props.joinGame(gameId)}>Join</div>
      );
    }
    // Invite action
    actions.push(
      <div className='invite-player'
        key='action-invite'
        onClick={()=>props.invitePlayer(gameId)}>Invite</div>
    );
    // Delete game
    if( isConfirmedPlayer ){
      actions.push(
        <div className='delete-game'
          key='action-delete'
          onClick={()=>props.deleteGame(gameId)}>Delete</div>
      );
    }
    // If enough players can start
    if( gameData.players.length >= MinPlayerCount && gameData.players.length <= MaxPlayerCount ){
      actions.push(
        <div className='start-game'
          key='start-delete'
          onClick={()=>props.startGame(gameId)}>Start</div>
      );
    }

    return (
      <div className='game'>
        Game Id: {gameId}<br />
        Status: {GameSessionStatus[gameData.status]}<br />
        Confirmed Players: <br />
        {playersUi}
        Invited Players: <br />
        {invitedPlayers}
        {actions}
      </div>
    );
  }

  function renderStartedGame(){
    // TODO
  }

  switch( gameData.status ){
    case GameSessionStatus.STARTED:
      return renderStartedGame();
    case GameSessionStatus.WAITING_FOR_PLAYERS:
      return renderGameWaitingForPlayers();
    default:
      return <div />;
  }


  // TODO list player size game ready to start when all players are there.
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

  // TODO check player status

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

    this.state = {
      gameList: {
        loading: true,
      },
    };
  }

  invitePlayer(gameId){
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
        if( doc.data().owners.includes(email) ){
          return doc.data().owners;
        }
        const newOwners = [email].concat(doc.data().owners);
        transaction.update(gameRef,{owners: newOwners});
        return newOwners;
      });
    }).then(newOwners=>{
      console.log('Invite successful', newOwners); // TODO
    }).catch(error => {
      alert('Error adding players', error); // TODO
    });
  }

  deleteGame(gameId){
    // TODO update state "deleting"
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
       status: GameSessionStatus.WAITING_FOR_PLAYERS,
       owners: [user.email],
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
    // TODO
  }

  componentDidMount() {
    const user = this.context;
    const {email} = user;
    // Subscribe to games list
    firestore.collection('games').where(
      "owners", "array-contains", email
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
        />
      </div>
    )
  }
}

export default ProfilePage;
