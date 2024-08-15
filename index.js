const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const members = new Set();

io.on('connection', (socket) => {
    socket.on('join', (nickname) => {
        socket.nickname = nickname;
        members.add(nickname);
        io.emit('update members', Array.from(members));
    });

    socket.on('chat message', (data) => {
        io.emit('chat message', data);
    });

    socket.on('disconnect', () => {
        if (socket.nickname) {
            members.delete(socket.nickname);
            io.emit('update members', Array.from(members));
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
