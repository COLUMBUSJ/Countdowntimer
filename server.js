const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let timerDuration = 90 * 60; // 90 minutes in seconds
let endTime = null;

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('a user connected');

    // Send the current timer status to the new connection
    if (endTime) {
        const remainingTime = Math.max(0, Math.round((endTime - Date.now()) / 1000));
        socket.emit('timer', { remainingTime });
    } else {
        socket.emit('timer', { remainingTime: timerDuration });
    }

    socket.on('start', () => {
        if (!endTime) {
            endTime = Date.now() + timerDuration * 1000;
            io.emit('timer', { remainingTime: timerDuration });
        } else {
            const remainingTime = Math.max(0, Math.round((endTime - Date.now()) / 1000));
            io.emit('timer', { remainingTime });
        }
    });

    socket.on('reset', () => {
        endTime = null;
        io.emit('timer', { remainingTime: timerDuration });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
