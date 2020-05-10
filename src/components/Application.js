import React, {useContext} from "react";
import { Router } from "@reach/router";
import SignIn from "./SignIn";
import ProfilePage from "./ProfilePage";
import { UserContext } from "../providers/UserProvider";

const Application = () => {
  const user = useContext(UserContext);
  return (
        user ?
        <ProfilePage />
      :
        <Router>
          <SignIn path="/" />
        </Router>

  );
}

export default Application;
