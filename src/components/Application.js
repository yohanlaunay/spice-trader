import React, {useContext} from "react";
import { Router } from "@reach/router";
import SignIn from "./SignIn";
import ProfilePage from "./ProfilePage";
import Game from "../game.js";
import { UserContext } from "../providers/UserProvider";

const Application = () => {
  const user = useContext(UserContext);
  // sign-in if needed
  if( !user ){
    return (
      <Router>
        <SignIn path="/" />
      </Router>
    );
  }
  // user is signed-in, send to profile page or game if selected
  return (
    <Router>
      <ProfilePage path="/" />
      <Game path="game/:gameId" />
    </Router>
  );
}

export default Application;
