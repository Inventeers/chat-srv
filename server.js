var https = require('https')
  , sio    = require('socket.io')
  , _     = require('lodash')
  , users = {}
  , port  = 8081
  , opts  = {
	  	key  : fs.readFileSync('path/to/key.key'),
	  	cert : fs.readFileSync('path/to/cert.crt'),
	  	ca   : fs.readFileSync('path/to/ca.crt')
	  };

// Initialize secure server
var app = https.createServer(opts);
io = sio.listen(app);
app.listen(port);

// Initialize unsecure, stand-alone server
// io = sio(port);

io.on('connection', function(socket) {
	socket.on('logon', function(username) {
		// Register user and 
		socket.username = username;
		users[username] = socket;

		console.log(socket.username + ' connected');

		io.sockets.emit('users', _.keys(users));
	});

	socket.on('send', function(user, msg) {
		if (users[user]) {
			users[user].emit('receive', socket.username, msg);
		}
	});

	socket.on('requestUsers', function() {
		socket.emit('users', _.keys(users));
	});

	socket.on('disconnect', function() {
		if (socket.username && users[socket.username]) {
			delete users[socket.username];

			console.log(socket.username + ' disconnected');
			
			io.sockets.emit('users', _.keys(users));
		}
	});
});