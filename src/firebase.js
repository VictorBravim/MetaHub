import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDp8TBxIwkI75LBl0LAPBeNZVBfG9D3dKA",
    authDomain: "metahub-d5df0.firebaseapp.com",
    projectId: "metahub-d5df0",
    storageBucket: "metahub-d5df0.appspot.com",
    messagingSenderId: "863235368484",
    appId: "1:863235368484:web:3885ff615b1e3f2b519ab1",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };