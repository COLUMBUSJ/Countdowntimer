const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const initialTime = 2 * 60; // 2 minutes in seconds
let remainingTime = initialTime;
let timerInterval = null;
let isCounting = false;

// Serve static files from the 'public' directory
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

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
        remainingTime = initialTime;
        isCounting = false;
        io.emit('timer', { remainingTime, isCounting });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
