const { initializeApp } = require("firebase/app");
const { getDatabase, ref, get } = require("firebase/database");

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyDH-MVLAHcVqpcsi5R3hRSE0BIqDkjqYW0",
    authDomain: "eng-word-dd044.firebaseapp.com",
    databaseURL: "https://eng-word-dd044-default-rtdb.firebaseio.com",
    projectId: "eng-word-dd044",
    storageBucket: "eng-word-dd044.firebasestorage.app",
    messagingSenderId: "528044187037",
    appId: "1:528044187037:web:9f0318c0a5b91fe80e2374"
};

// Firebase 초기화
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

// API 키를 가져오는 함수
async function getAPIKEY() {
    const apiKeyRef = ref(database, "openai/apikey"); // Firebase Realtime Database 경로
    const snapshot = await get(apiKeyRef);

    if (snapshot.exists()) {
        return snapshot.val();
    } else {
        throw new Error("API key not found in Firebase.");
    }
}

module.exports = { getAPIKEY };