var io = require('socket.io').listen(8080);
var num = 0; //количество игроков
var r = 1; //номер комнаты

io.sockets.on('connection', function (socket) {
	num++;
	console.log ('Игрок подключен. Кол-во игроков: '+num);

	if (num % 2 == 0) {
		socket.join('room'+r);
		socket.broadcast.in('room'+r).emit('start', 'white');
		socket.emit('start', 'black');
		console.log ('Игрок отправлен в комнату '+r);
		r++;
	} else {
		socket.join('room'+r);
		console.log ('Игрок отправлен в комнату '+r);
		
	}

	socket.on ('step', function (x,y,x1,y1) {
		console.log ('Приняты координаты x: %d, y: %d, x1: %d, y1: %d', x,y,x1,y1);
		socket.broadcast.in('room'+(r-1).toString()).emit('step',parseInt(x),parseInt(y),parseInt(x1),parseInt(y1));
	});

	socket.on('finish', function() {
		socket.broadcast.in('room'+(r-1)).emit('finish');
		console.log('lose sent!');
	});


	socket.on('disconnect', function () {
		num--;
		socket.leave('room'+r);
		r--;
		console.log ('Игрок отключен. Кол-во игроков: '+num);
		socket.broadcast.in('room'+r).emit('disconnect');


	});
});