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

io.on('connection', (socket) => {
	console.log('User connected');
	
	const child = spawn('rtl_433', ['-f', '319500000', '-R', '100', '-F', 'json']);
	
	let result = '';

	child.stdout.on('data', (data) => {
		output = data.toString().trim()
		outputLength = output.length
		
		if (output[0] == "{") {
			result += output
		} else if (output[outputLength - 1] === "}") {
			result += output
			console.log("###################");
			console.log(result);
			//let data = JSON.parse(result); <- result is not valid json
			
			// Stream data to client
			io.emit('stdout', result);
			
			result = '';
		} else {
			result += output;
		}
	});
	
	child.on('close', (data) => {
		console.log(`data: ${data}` );
	});
	
});

app.get('/', (req, res, next) => {
	res.sendFile(__dirname + '/public/index.html');
});

http.listen(3000, () => {
	console.log(`${ip.address()}:3000`);
});
