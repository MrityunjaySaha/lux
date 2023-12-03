import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import { serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBX-T_cbXjHt4HcpdmsblZXLmrZI0tYGVs",
  authDomain: "lux1-f88a3.firebaseapp.com",
  projectId: "lux1-f88a3",
  storageBucket: "lux1-f88a3.appspot.com",
  messagingSenderId: "731696573818",
  appId: "1:731696573818:web:47ebf7b1633ff717093ac3",
  measurementId: "G-G8Z20K3CD6"
};

firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore(); 
export const auth = firebase.auth();
export const storage = firebase.storage();
export const firestore = firebase.firestore();
export const timestamp = serverTimestamp(); // Use serverTimestamp
//xgdh-dtud-lxxd-unpy-ujiz Stripe
//npm start
//node server
//

