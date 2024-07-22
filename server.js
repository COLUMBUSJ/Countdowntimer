const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let timerDuration = 90 * 60; // 90 minutes in seconds
let endTime = null;
let isCounting = false;

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('a user connected');

    if (endTime && isCounting) {
        const remainingTime = Math.max(0, Math.round((endTime - Date.now()) / 1000));
        socket.emit('timer', { remainingTime });
    } else {
        socket.emit('timer', { remainingTime: timerDuration });
    }

    socket.on('start', (data) => {
        if (!isCounting) {
            endTime = Date.now() + data.remainingTime * 1000;
            isCounting = true;
            io.emit('timer', { remainingTime: data.remainingTime });
        }
    });

    socket.on('stop', () => {
        if (isCounting) {
            timerDuration = Math.max(0, Math.round((endTime - Date.now()) / 1000));
            isCounting = false;
            endTime = null;
            io.emit('timer', { remainingTime: timerDuration });
        }
    });

    socket.on('reset', () => {
        isCounting = false;
        endTime = null;
        timerDuration = 90 * 60; // Reset to 90 minutes
        io.emit('timer', { remainingTime: timerDuration });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
