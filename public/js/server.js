var io = require('socket.io').listen(8888, '0.0.0.0');
var r = 1; //номер комнаты

io.sockets.on('connection', function (socket) {

	var closedRooms = [];

	socket.join('room'+r);
	
	closedRooms ['room'+r] = 0; //0 - не закрыта;

	roomsArr = io.sockets.manager.rooms; //массив всех комнат

	for (var room in roomsArr) {
		var gamersNum = roomsArr[room].length;
		//slice нужен, т.к. room возвращает комнату в формате '/room1',
		//а *.in() требует просто room. Срезаем '/''
		_room = room.slice(1,room.length);
		if (room != '') { //комната с пустым именем - общая комната со всеми сокетами
			//console.log ('room: ' +room + ' arr[room]: '+roomsArr[room]+' игроков в комнате: '+roomsArr[room].length);
			if ((gamersNum == 2) && (closedRooms[_room] == 0)) {
				socket.broadcast.in(_room).emit('start', 'white');
				socket.emit('start', 'black'); //отправляем сообщение о старте игры
				console.log('Игра началась в комнате'+room+'!');
				closedRooms[_room] = 1;
				r++;
			}
		}
	}

	//проверка куда добавляется игрок и закрывается ли эта комната
	for (var room in closedRooms) {
		console.log ('room: '+room+ ', закрыто? :'+ closedRooms[room]);
	}

	socket.on ('step', function (x,y,x1,y1) {
		console.log ('Приняты координаты x: %d, y: %d, x1: %d, y1: %d', x,y,x1,y1);
		for (var room in io.sockets.manager.roomClients[socket.id]) { //проход по всем комнатам
			if (room != '') { //если не главная (с пустым названием)
				_room = room.slice(1,room.length); //отрезаем '/'
				//socket.emit('step',parseInt(x),parseInt(y),parseInt(x1),parseInt(y1)); //удалить
				socket.broadcast.in(_room).emit('step',parseInt(x),parseInt(y),parseInt(x1),parseInt(y1)); //передаем данные клиенту в комнату из которой они пришли
			}
		} 
		
	});

	socket.on('cheatCatch', function() {
		for (var room in io.sockets.manager.roomClients[socket.id]) { //проход по всем комнатам
			if (room != '') { //если не главная (с пустым названием)
				_room = room.slice(1,room.length); //отрезаем '/'
				r = 1; //откатываем стартовую комнату на первую
				closedRooms[_room] = 0; //комната свободна
				socket.broadcast.in(_room).emit('finish'); //рассылаем команду "финиш"
			}
		}
	});

	socket.on('finish', function() {
		for (var room in io.sockets.manager.roomClients[socket.id]) { //проход по всем комнатам
			if (room != '') { //если не главная (с пустым названием)
				_room = room.slice(1,room.length); //отрезаем '/'
				r = 1; //откатываем стартовую комнату на первую
				closedRooms[_room] = 0; //комната свободна
				socket.broadcast.in(_room).emit('finish'); //рассылаем команду "финиш"
			}
		}
	});

	socket.on('disconnect', function () {
		for (var room in io.sockets.manager.roomClients[socket.id]) { //проход по всем комнатам в которых сидит данный игрок
			if (room != '') { //если не главная (с пустым названием)
				_room = room.slice(1,room.length); //отрезаем '/'
				r = 1;	 //откатываем стартовую комнату на первую
				closedRooms[_room] = 0; //комната свободна
				socket.broadcast.in(_room).emit('disconnect'); //рассылаем "дисконнет"
			}
		}
		
		console.log ('Игрок отключен. Кол-во игроков: '+io.sockets.manager.rooms[''].length);
		
	});
});