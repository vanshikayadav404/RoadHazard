/**
 * RoadHazard Reporter - Firebase Configuration
 * 
 * Replace the empty placeholder values below with your Firebase Project credentials.
 * You can obtain these from the Firebase Console (https://console.firebase.google.com/):
 * 1. Open your Firebase project.
 * 2. Click the Settings gear icon > Project settings.
 * 3. Under the "Your apps" section, click on your Web app (</>) or create one.
 * 4. Copy the config values into the fields below.
 */


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDUc1QjcdfHF62lY0fAC9TheP0tP-ng3sY",
  authDomain: "roadhazard-f7947.firebaseapp.com",
  projectId: "roadhazard-f7947",
  storageBucket: "roadhazard-f7947.firebasestorage.app",
  messagingSenderId: "661633168722",
  appId: "1:661633168722:web:4a13800298a626f735b68b",
  measurementId: "G-H046PWB0FP"
};

// Make accessible on the global window object
if (typeof window !== "undefined") {
  window.firebaseConfig = firebaseConfig;
}
