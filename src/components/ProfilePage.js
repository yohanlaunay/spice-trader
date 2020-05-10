import React from "react";
import { UserContext } from "../providers/UserProvider";
import {auth, firestore} from "../firebase";
import GameEngine from "../game-engine.js";

const GameSessionStatus = {
  WAITING_FOR_PLAYERS: 'WAITING_FOR_PLAYERS',
  STARTED: 'STARTED',
};

const GameSession = (props) => {
  const gameId = props.gameId;
  const gameData = props.gameData;

  return (
    <div className='game'>
      Game Id: {gameId}<br />
      Status: {GameSessionStatus[gameData.status]}<br />
      Players: {gameData.owners.join(', ')}<br />
      <button onClick={()=>alert('View!!!')}> View</button>
    </div>
  );
};

const GameSessionList = (props) => {
  // const user = props.user;
  // const {photoURL, displayName, email} = user;
  const gameList = props.value;

  function createGame(){
    console.log("Create Game");
     firestore.collection(`games`).add({
       status: GameSessionStatus.WAITING_FOR_PLAYERS,
       owners: [props.userEmail],
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
    firestore.collection('games').where(
      "owners", "array-contains", email
    ).get().then(snapshot => {
        const games = {};
        snapshot.forEach(doc => games[doc.id] = doc.data());
        this.setState({
          gameList: {
            loading: false,
            games: games,
          }
        });
    }).catch(error => {
      // TODO show error update update update state
      console.log("Error fetching list of games", error);
    })
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
        <GameSessionList value={this.state.gameList} />
      </div>
    )
  }
}

export default ProfilePage;
