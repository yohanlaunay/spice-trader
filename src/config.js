import * as firebase from "firebase/app";

const FirebaseConfig = {
  apiKey: "AIzaSyAkj7_1NkJr6d6RRT2qPbl-b8KvePwipRA",
  authDomain: "spice-trader.firebaseapp.com",
  databaseURL: "https://spice-trader.firebaseio.com",
  projectId: "spice-trader",
  storageBucket: "spice-trader.appspot.com",
  messagingSenderId: "1073649112285",
  appId: "1:1073649112285:web:a9fbe1b87111dbe5377734"
};

firebase.initializeApp(FirebaseConfig);

export default firebase;
