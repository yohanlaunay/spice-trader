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

  // TODO list player size game ready to start when all players are there.

  function invitePlayer(){
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
          throw 'Game deleted';
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
      console.log('Error adding players', error); // TODO
    });
  }

  function deleteGame(){
    firestore.collection('games').doc(gameId).delete()
    .then(()=>{
      console.log("Delete successful");
    }).catch(error => {
      console.log("Error deleting the game",error);
    });
  }

  function joinGame(){
    // TODO update state "inviting"
    const gameRef = firestore.collection('games').doc(gameId);
    firestore.runTransaction(transaction => {
      return transaction.get(gameRef).then(doc => {
        if( ! doc.exists ){
          throw 'Game deleted';
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
      console.log('Error joining session', error); // TODO
    });
  }

  let playersUi = [];
  gameData.players.forEach(player => {
    playersUi.push(
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

  // TODO cannot join if already joined.

  return (
    <div className='game'>
      Game Id: {gameId}<br />
      Status: {GameSessionStatus[gameData.status]}<br />
      Confirmed Players: <br />
      {playersUi}
      Invited Players: <br />
      {invitedPlayers}
      <button onClick={joinGame}>Join</button> |
      <button onClick={invitePlayer}>Invite</button> |
      <button onClick={deleteGame}>Delete Game</button>
    </div>
  );
};

const GameSessionList = (props) => {
  // const user = props.user;
  // const {photoURL, displayName, email} = user;
  const gameList = props.value;
  const user = props.user;
  const {uid, photoURL, displayName, email} = user;

  function createGame(){
    console.log("Create Game");
     firestore.collection('games').add({
       status: GameSessionStatus.WAITING_FOR_PLAYERS,
       owners: [email],
       players: [{
         uid: uid,
         img: photoURL,
         name: displayName,
         email: email,
       }],
       game: null,
     }).then((docRef) => {
       console.log("New Game created with id:", docRef.id);
     }).catch((error) => {
       console.log("Error creating game:",error);
     });
  }

  if( gameList.loading ){
    return (
      <div className='game-list'>
        Loading...
      </div>
    );
  }

  // TODO check player status

  const games = [];
  Object.entries(gameList.games).map(data => {
    const gameId = data[0];
    const gameData = data[1];
    games.push(
      <GameSession
        key={gameId}
        user={user}
        gameId={gameId}
        gameData={gameData}
      />
    );
  });

  return (
    <div className='game-list'>
      <button onClick={createGame}>Create Game</button>
      {games}
    </div>
  );
}

class ProfilePage extends React.Component {

  static contextType = UserContext;

  constructor(props){
    super(props);

    this.state = {
      gameList: {
        loading: true,
      },
    };
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
        />
      </div>
    )
  }
}

export default ProfilePage;
