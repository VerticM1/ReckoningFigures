// Firebase Configuration for Reckoning Figures

const firebaseConfig = {
    apiKey: "AIzaSyA3uLzOVcNw9cFQ37pHnktHAVbBRASXico",
    authDomain: "reckoningfigures-bbdae.firebaseapp.com",
    projectId: "reckoningfigures-bbdae",
    storageBucket: "reckoningfigures-bbdae.firebasestorage.app",
    messagingSenderId: "174051558845",
    appId: "1:174051558845:web:d459a96c6d94c108e63ed4",
    measurementId: "G-B1SGPTYM48"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other files
window.firebaseAuth = auth;
window.firebaseDB = db;

console.log('Firebase initialized successfully!');

