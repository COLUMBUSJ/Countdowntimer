document.addEventListener('DOMContentLoaded', (event) => {
    const socket = io();

    const timerDisplay = document.getElementById('timer');
    const chinaTimeDisplay = document.getElementById('china-time');
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

    // 更新中国时间显示
    function updateChinaTime() {
        const now = new Date();
        const chinaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // 将当前时间转换为中国时间
        const hours = chinaTime.getUTCHours();
        const minutes = chinaTime.getUTCMinutes();
        const seconds = chinaTime.getUTCSeconds();
        chinaTimeDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // 修正中国时间显示
    function updateChinaTime() {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const chinaTime = new Date(utc + (3600000 * 8)); // 将UTC时间转换为中国时间
        const hours = chinaTime.getHours();
        const minutes = chinaTime.getMinutes();
        const seconds = chinaTime.getSeconds();
        chinaTimeDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
