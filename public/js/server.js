const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
const { getAPIKEY } = require('./firebase-config'); // Firebase 설정 가져오기
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 정적 파일 제공
const path = require('path');
app.use('/public', express.static(path.join(__dirname, 'public')));

// 기본 HTML 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// OpenAI API 프록시
app.use(express.json());

app.post('/api/openai', async (req, res) => {
    try {
        const apiKey = await getAPIKEY(); // Firebase에서 API 키 가져오기

        const openai = new OpenAIApi(
            new Configuration({
                apiKey, // 동적으로 가져온 API 키
            })
        );

        const { model, messages } = req.body;

        const response = await openai.createChatCompletion({
            model: model || 'gpt-3.5-turbo',
            messages,
        });

        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error communicating with OpenAI API or Firebase' });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on https://skyshim-github-io.onrender.com:${PORT}`);
});