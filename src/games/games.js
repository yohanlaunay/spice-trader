import React, {useContext} from "react";
import {navigate} from "@reach/router";
import { UserContext } from "../providers/UserProvider";
import SpiceTraderEngine from './spices/engine.js';
import SpiceTraderApp from './spices/app.js';

const Games = {
    spicetrader: {
      gameType: 'spicetrader',
      name: 'Century Spice Road',
      duration: '25min - 45min',
      minPlayerCount: SpiceTraderEngine.minPlayerCount,
      maxPlayerCount: SpiceTraderEngine.maxPlayerCount,
      createGameSession: SpiceTraderEngine.createGameSession,
    },
};
export default Games;

export const GamesRouter = (props) => {
  const user = useContext(UserContext);
  const gameId = props.gameId;
  const gameType = props.gameType;

  if( !user || ! gameId || ! gameType ){
    return navigate('/');
  }
  // user is signed-in, send to the requested game
  switch( gameType ){
    case Games.spicetrader.gameType:
    default:
      return (<SpiceTraderApp gameId={gameId} />);
  }
}
