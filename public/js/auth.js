import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

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
export const auth = getAuth(app);
const db = getDatabase(app);

// 회원가입 기능
if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('id').value; // 사용자 ID
        const password = document.getElementById('password').value;

        try {
            // ID 중복 검사
            const dbRef = ref(db);
            const snapshot = await get(child(dbRef, `users/${id}`));
            if (snapshot.exists()) {
                alert('ID already exists. Please choose another one.');
                return;
            }

            // 사용자 생성
            const userCredential = await createUserWithEmailAndPassword(auth, `${id}@example.com`, password); // 이메일 형식이 필요하므로 가짜 이메일 사용
            const user = userCredential.user;

            // 사용자 정보를 Realtime Database에 저장
            await set(ref(db, `users/${id}`), {
                id: id,
                uid: user.uid // Firebase Authentication에서 생성된 고유 사용자 ID
            });

            alert('Sign-up successful!');
            window.location.href = '/';
        } catch (error) {
            alert('Sign-up failed: ' + error.message);
        }
    });
}

// 로그인 기능
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('id').value;
        const password = document.getElementById('password').value;

        console.log(id, password)

        try {
            // ID로 사용자 UID 확인
            const dbRef = ref(db);
            const snapshot = await get(child(dbRef, `users/${id}`));
            if (!snapshot.exists()) {
                alert('ID가 존재하지 않습니다.');
                return;
            }

            const userData = snapshot.val();
            const email = `${id}@example.com`; // 가짜 이메일 생성

            // 이메일로 로그인 시도
            await signInWithEmailAndPassword(auth, email, password);
            const loggedInUserId = id;

            localStorage.setItem("loggedInUser", loggedInUserId);

            alert('Login successful!');
            window.location.href = `/home?user=${encodeURIComponent(id)}`;
        } catch (error) {
            if (error.code === 'auth/wrong-password') {
                alert('비밀번호가 맞지 않습니다.');
            } else {
                alert('Login failed: ' + error.message);
            } //잘 안되는듯..
            // alert('비밀번호가 맞지 않습니다.');
        }
    });
}

// 사용자 인증 상태 확인
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('Logged in as:', user.uid);
        localStorage.setItem('loggedInUser', user.uid);
    } else {
        console.log('No user logged in');
    }
});