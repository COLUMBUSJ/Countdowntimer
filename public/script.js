document.addEventListener('DOMContentLoaded', (event) => {
    const socket = io();

    const chinaTimeDisplay = document.getElementById('china-time');
    const nextDrawTimeDisplay = document.getElementById('next-draw-time');
    const timerDisplay = document.getElementById('timer');
    const startStopButton = document.getElementById('startStopButton');
    const resetButton = document.getElementById('resetButton');

    let timerInterval = null;
    let isCounting = false;
    const initialTime = 2 * 60; // 2 minutes in seconds
    let timeRemaining = initialTime;

    const drawTimes = [
        { hours: 20, minutes: 0 },
        { hours: 21, minutes: 30 },
        { hours: 23, minutes: 0 }
    ];

    // 更新中国时间显示
    function updateChinaTime() {
        const now = new Date();
        const chinaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // 将当前时间转换为中国时间
        const hours = chinaTime.getUTCHours();
        const minutes = chinaTime.getUTCMinutes();
        const seconds = chinaTime.getUTCSeconds();
        chinaTimeDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        updateNextDrawTime(hours, minutes, seconds);
    }

    // 计算并更新距离下次抽奖的时间
    function updateNextDrawTime(currentHours, currentMinutes, currentSeconds) {
        let nextDraw = null;
        for (let drawTime of drawTimes) {
            if (currentHours < drawTime.hours || (currentHours === drawTime.hours && currentMinutes < drawTime.minutes)) {
                nextDraw = drawTime;
                break;
            }
        }

        if (!nextDraw) {
            nextDraw = drawTimes[0];
        }

        const now = new Date();
        const nextDrawTime = new Date(now);
        nextDrawTime.setUTCHours(nextDraw.hours - 8, nextDraw.minutes, 0, 0); // 设置下次抽奖的中国时间

        let timeToNextDraw = (nextDrawTime - now) / 1000;
        if (timeToNextDraw < 0) {
            nextDrawTime.setUTCDate(nextDrawTime.getUTCDate() + 1); // Add one day if the next draw time is tomorrow
            timeToNextDraw = (nextDrawTime - now) / 1000;
        }

        const hours = Math.floor(timeToNextDraw / 3600);
        const minutes = Math.floor((timeToNextDraw % 3600) / 60);
        const seconds = Math.floor(timeToNextDraw % 60);
        nextDrawTimeDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // 更新页面上的计时器显示
    function updateDisplay(time) {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // 接收服务器发送的计时器状态更新
    socket.on('timer', (data) => {
        updateDisplay(data.remainingTime);
        isCounting = data.isCounting;

        if (isCounting && !timerInterval) {
            timerInterval = setInterval(() => {
                if (data.remainingTime > 0) {
                    data.remainingTime--;
                    updateDisplay(data.remainingTime);
                } else {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    isCounting = false;
                }
            }, 1000);
        } else if (!isCounting && timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    });

    // 启动倒计时
    startStopButton.addEventListener('click', () => {
        if (isCounting) {
            socket.emit('stop');
        } else {
            socket.emit('start');
        }
    });

    // 重置倒计时
    resetButton.addEventListener('click', () => {
        socket.emit('reset');
    });

    // 初始化显示
    updateChinaTime();
    setInterval(updateChinaTime, 1000);
});
