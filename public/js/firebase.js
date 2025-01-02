// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase , ref, set , child, get} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDH-MVLAHcVqpcsi5R3hRSE0BIqDkjqYW0",
    authDomain: "eng-word-dd044.firebaseapp.com",
    databaseURL: "https://eng-word-dd044-default-rtdb.firebaseio.com",
    projectId: "eng-word-dd044",
    storageBucket: "eng-word-dd044.firebasestorage.app",
    messagingSenderId: "528044187037",
    appId: "1:528044187037:web:9f0318c0a5b91fe80e2374"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db =  getDatabase(app);
const dbRef = ref(db);

export function insertWord(category, chapter, word, meaning, ex1, ex2, ex3, ex4, ex5) {
    set(ref(db, category + '/' + chapter + '/' + word), {
        word: word,
        meaning: meaning,
        ex1: ex1,
        ex2: ex2,
        ex3: ex3,
        ex4: ex4,
        ex5: ex5
    });
}

export function getWord(category, chapter) {
    get(child(dbRef, `${category}/${chapter}`)).then((snapshot) => {
        if (snapshot.exists()) {
            console.log(snapshot.val());
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    })
}

async function getAPIKEY() {
    const snapshot = await get(child(dbRef, 'openai/apikey'))
    if (snapshot.exists) {
        return snapshot.val();
    }
}

export const OPENAI_API_KEY = await getAPIKEY();
