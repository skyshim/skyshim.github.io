import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, set, child, get, remove } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase 초기화
const firebaseConfig = {
    apiKey: "AIzaSyDH-MVLAHcVqpcsi5R3hRSE0BIqDkjqYW0",
    authDomain: "eng-word-dd044.firebaseapp.com",
    databaseURL: "https://eng-word-dd044-default-rtdb.firebaseio.com",
    projectId: "eng-word-dd044",
    storageBucket: "eng-word-dd044.firebasestorage.app",
    messagingSenderId: "528044187037",
    appId: "1:528044187037:web:9f0318c0a5b91fe80e2374"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db);

export async function addWordbook(userId, wordbookId, wordbookName) {
    const wordbookRef = ref(db, `users/${userId}/words/${wordbookId}`);
    await set(wordbookRef, { name: wordbookName });
}

export async function removeWordbook(userId, wordbookId) {
    const wordbookRef = ref(db, `users/${userId}/words/${wordbookId}`);
    await remove(wordbookRef);
}

export async function getWordbooks(userId) {
    const wordbooksRef = ref(db, `users/${userId}/words`);
    const snapshot = await get(wordbooksRef);
    return snapshot.exists() ? snapshot.val() : {};
}

//단어 추가
export function insertWord(userid, category, chapter, word, ex1, ex2, ex3, ex4, ex5) {
    set(ref(db, `users/${userid}/words/${category}/${chapter}/${word}`), {
        word, ex1, ex2, ex3, ex4, ex5
    });
}

//단어 수 가져오기
export async function getWordCount(userid, category, chapter) {
    const chapterRef = child(dbRef, `users/${userid}/words/${category}/${chapter}`);
    const snapshot = await get(chapterRef);
    if (snapshot.exists()) {
        return Object.keys(snapshot.val()).length;
    } else {
        return 0;
    }
}

//단어 삭제
export async function deleteWord(userid, category, chapter, word) {
    const wordRef = ref(db, `users/${userid}/words/${category}/${chapter}/${word}`);
    await remove(wordRef);
}

//전체 데이터 불러오기
export function loadFirebaseData(userid) {
    return new Promise((resolve, reject) => {
        get(child(dbRef, `users/${userid}/words`)).then((snapshot) => {
            try {
                if (!snapshot.exists()) {
                    reject(new Error('No data available'));
                    return;
                }

                const rawData = snapshot.val();
                const firebaseData = {};

                for (const wordbook in rawData) {
                    firebaseData[wordbook] = {};
                    for (const chapter in rawData[wordbook]) {
                        firebaseData[wordbook][chapter] = [];
                        for (const wordKey in rawData[wordbook][chapter]) {
                            const wordData = rawData[wordbook][chapter][wordKey];
                            const exampleSentences = [wordData.ex1, wordData.ex2, wordData.ex3, wordData.ex4, wordData.ex5].filter(Boolean);
                            
                            const examples = exampleSentences.map(example => {
                                const [english, korean] = example.split('|');
                                const maskedEnglish = english.replace(new RegExp(`\\b${wordData.word}\\b`, 'gi'), (match) => {
                                    return match[0] + '_'.repeat(match.length - 1);
                                });
                                return { english: maskedEnglish, korean };
                            });

                            firebaseData[wordbook][chapter].push({
                                examples: examples,
                                korean: `<strong>${wordData.word}</strong>`,
                                word: wordData.word
                            });
                        }
                    }
                }
                
                resolve(firebaseData);
            } catch (error) {
                reject(error);
            }
        }).catch(reject);
    });
}