const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let timerDuration = 90 * 60; // 90 minutes in seconds
let remainingTime = timerDuration;
let endTime = null;
let countdown;
let isCounting = false;

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('a user connected');

    // Send the current timer status to the new connection
    if (isCounting) {
        const remainingTime = Math.max(0, Math.round((endTime - Date.now()) / 1000));
        socket.emit('timer', { remainingTime });
    } else {
        socket.emit('timer', { remainingTime: timerDuration });
    }

    socket.on('start', (data) => {
        if (!isCounting) {
            remainingTime = data.remainingTime;
            endTime = Date.now() + remainingTime * 1000;
            isCounting = true;
            countdown = setInterval(() => {
                remainingTime = Math.max(0, Math.round((endTime - Date.now()) / 1000));
                io.emit('timer', { remainingTime });
                if (remainingTime <= 0) {
                    clearInterval(countdown);
                    isCounting = false;
                }
            }, 1000);
            io.emit('timer', { remainingTime });
        }
    });

    socket.on('stop', () => {
        if (isCounting) {
            clearInterval(countdown);
            isCounting = false;
            endTime = null;
            io.emit('timer', { remainingTime });
        }
    });

    socket.on('reset', () => {
        clearInterval(countdown);
        isCounting = false;
        endTime = null;
        remainingTime = timerDuration;
        io.emit('timer', { remainingTime });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
