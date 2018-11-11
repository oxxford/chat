const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', function(req, res) {
    res.sendFile(__dirname +  "/index.html");
}); 

http.listen(3000, function() {
    console.log('lisntening on *:3000');
});

io.on('connection', function(socket) {
    function log() {
        let array = ['>>> '];
        for (let index = 0; index < arguments.length; index++){
            array.push(arguments[index]);
        }
    }

    socket.on('message', function(message) {
        log('Got message:', message);
        socket.broadcast.emit('message', message);
    });

    socket.on('create or join', function(room) {
        let numClients = io.sockets.clients(room).length;

        log(`Room ${room} has ${numClients} clinet(s)`);
        log('Request to create or join room', room);

        if (numClients === 0) {
            socket.join(room);
            socket.emit('created', room);
        } else if (numClients === 1) {
            io.sockets.in(room).emit('join', room);
            socket.join(room);
            socket.emit('joined', room);
        } else {
            socket.emit('full', room);
        }

        socket.emit(`emit(): client ${socket.id} joined room ${room}`);
        socket.broadcast.emit(
            `broadcast(): client ${socket.id} joined room ${room}`
        );
    })
});