const express = require('express');
const cors = require('cors');
const path = require('path');
const { getAPIKEY } = require('./public/js/firebase-config'); // Firebase 설정
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정 (모든 도메인에서 요청 허용)
app.use(cors());

// 정적 파일 제공
app.use('/public', express.static(path.join(__dirname, 'public')));

// 기본 HTML 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// wordtest.html 제공
app.get('/wordtest', (req, res) => {
    res.sendFile(path.join(__dirname, 'wordtest.html'));
});


// OpenAI API 프록시
app.use(express.json());

app.post('/api/openai', async (req, res) => {
    try {
        const apiKey = await getAPIKEY();  // Firebase에서 API 키를 가져옴

        // OpenAI 인스턴스 생성 (openai 4.x.x에서는 Configuration과 OpenAIApi 대신 OpenAI 사용)
        const openai = new OpenAI({
            apiKey, // Firebase에서 가져온 API 키
        });

        const { model, messages } = req.body;

        // OpenAI API 호출
        const response = await openai.chat.completions.create({
            model: model || 'gpt-3.5-turbo',  // 기본 모델 설정
            messages,
        });

        // 응답 반환
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Error communicating with OpenAI API', message: error.message });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on https://skyshim-github-io.onrender.com/:${PORT}`);
});