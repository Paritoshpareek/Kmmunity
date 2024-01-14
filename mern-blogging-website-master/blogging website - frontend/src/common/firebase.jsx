// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCPFGl-6NKUiJvR18RA_8jM9B1MJUgHUNo",
    authDomain: "blogging-app-e0e54.firebaseapp.com",
    projectId: "blogging-app-e0e54",
    storageBucket: "blogging-app-e0e54.appspot.com",
    messagingSenderId: "302382838753",
    appId: "1:302382838753:web:be143875dbc31e98f9d8a0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//google auth
const provider = new GoogleAuthProvider()

const auth = getAuth();
export const authWithGoogle = async () => {
    let user = null;
    await signInWithPopup(auth, provider)
        .then((result) => {
            user = result.user
        })
        .catch((err) => {
            console.log(err)
        })
    return user;
}