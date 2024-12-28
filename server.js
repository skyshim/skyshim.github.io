const express = require('express')
const app = express()

app.listen(8080, () => {
    console.log('http://218.149.2.75:8080 에서 서버 실행중')
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})