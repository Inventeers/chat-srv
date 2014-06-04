var io = require('socket.io')(8081)
  , _ = require('lodash')
  , users = {};

io.on('connection', function(socket) {
	socket.on('logon', function(username) {
		// Register user and 
		socket.username = username;
		users[username] = socket;

		console.log(socket.username + ' connected');

		io.emit('users', _.keys(users));
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
			
			// io.sockets.emit didnt work, apparently?
			io.sockets.emit('users', _.keys(users));
			/*_.each(users, function(sock) {
				sock.emit('users', _.keys(users));
			});*/
		}
	});
});