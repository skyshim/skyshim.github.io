//node.js server connection
const express = require('express');
const path = require('path')
const app = express();

app.use(express.static(path.join(__dirname, 'public'))) //yes
app.listen(8080, function(){
    console.log('listening to 8080')
})

//backend code start

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html')
})