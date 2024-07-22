document.addEventListener('DOMContentLoaded', (event) => {
    const socket = io();

    const timerDisplay = document.getElementById('timer');
    const startStopButton = document.getElementById('startStopButton');
    const resetButton = document.getElementById('resetButton');

    let timerInterval = null;
    let isCounting = false;

    // 更新页面上的计时器显示
    function updateDisplay(time) {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;
        timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
});
