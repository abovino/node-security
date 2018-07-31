const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const ip = require('ip');
const path = require('path');
const { spawn } = require('child_process');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));

const child = spawn('python', ['start_sdr.py']);

io.on('connection', (socket) => {
	console.log('User connected');
});

app.get('/', (req, res, next) => {
	res.sendFile(__dirname + '/public/index.html');
});

app.post('/emit', (req, res, next) => {
	console.log(req.body);
	io.sockets.emit('stdout', req.body);
	res.send({status: 'success'});
});

http.listen(3000, () => {
	console.log(`${ip.address()}:3000`);
});

