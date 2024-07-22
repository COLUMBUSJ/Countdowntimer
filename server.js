const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let timerDuration = 90 * 60; // 90 minutes in seconds
let remainingTime = timerDuration;
let timerInterval = null;
let isCounting = false;

// Serve static files from the 'public' directory
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('a user connected');
    
    // Send the current timer status to the new connection
    socket.emit('timer', { remainingTime, isCounting });

    socket.on('start', () => {
        if (!isCounting) {
            isCounting = true;
            timerInterval = setInterval(() => {
                if (remainingTime > 0) {
                    remainingTime--;
                    io.emit('timer', { remainingTime, isCounting });
                } else {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    isCounting = false;
                    io.emit('timer', { remainingTime, isCounting });
                }
            }, 1000);
            io.emit('timer', { remainingTime, isCounting });
        }
    });

    socket.on('stop', () => {
        if (isCounting) {
            clearInterval(timerInterval);
            timerInterval = null;
            isCounting = false;
            io.emit('timer', { remainingTime, isCounting });
        }
    });

    socket.on('reset', () => {
        clearInterval(timerInterval);
        timerInterval = null;
        remainingTime = timerDuration;
        isCounting = false;
        io.emit('timer', { remainingTime, isCounting });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
