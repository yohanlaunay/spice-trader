import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

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

const provider = new firebase.auth.GoogleAuthProvider();

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const signInWithGoogle = () => {
  auth.signInWithPopup(provider);
};

export const generateUserDocument = async (user, additionalData) => {
  if (!user) return;
  const userRef = firestore.doc(`users/${user.uid}`);
  const snapshot = await userRef.get();
  if (!snapshot.exists) {
    const { email, displayName, photoURL } = user;
    try {
      await userRef.set({
        displayName,
        email,
        photoURL,
        ...additionalData
      });
    } catch (error) {
      console.error("Error creating user document", error);
    }
  }
  return getUserDocument(user.uid);
};
const getUserDocument = async uid => {
  if (!uid) return null;
  try {
    const userDocument = await firestore.doc(`users/${uid}`).get();
    return {
      uid,
      ...userDocument.data()
    };
  } catch (error) {
    console.error("Error fetching user", error);
  }
};
