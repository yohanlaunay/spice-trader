import React from "react";
import Application from "./components/Application";
import UserProvider from "./providers/UserProvider";

const App = () => {
  return (
    <UserProvider>
      <Application />
    </UserProvider>
  );
};

export default App;
