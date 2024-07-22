// 获取页面元素
const timerDisplay = document.getElementById('timer');
const startStopButton = document.getElementById('startStopButton');
const resetButton = document.getElementById('resetButton');

// 倒计时初始时间为1小时30分钟
const initialTime = 1 * 60 * 60 + 30 * 60; // 1小时30分钟转换为秒
let timeRemaining = initialTime;
let timerInterval = null; // 用于存储定时器的 ID
let isCounting = false; // 用于跟踪定时器状态

// 更新页面上的计时器显示
function updateDisplay() {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 启动倒计时
function startTimer() {
    if (timerInterval !== null) return; // 如果定时器已经在运行，则不做任何操作

    timerInterval = setInterval(() => {
        if (timeRemaining > 0) {
            timeRemaining--;
            updateDisplay();
        } else {
            clearInterval(timerInterval); // 倒计时结束，清除定时器
            timerInterval = null; // 使定时器 ID 变为 null
            isCounting = false; // 结束倒计时状态
            startStopButton.textContent = 'Start';
        }
    }, 1000);
}

// 停止倒计时
function stopTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval); // 清除定时器
        timerInterval = null; // 使定时器 ID 变为 null
        isCounting = false; // 停止倒计时状态
    }
}

// 切换倒计时状态
function toggleCountdown() {
    if (isCounting) {
        stopTimer(); // 如果正在计时，则停止
        startStopButton.textContent = 'Start'; // 更新按钮文本
    } else {
        startTimer(); // 如果未在计时，则启动
        isCounting = true; // 开始倒计时状态
        startStopButton.textContent = 'Stop'; // 更新按钮文本
    }
}

// 重置倒计时
function resetTimer() {
    stopTimer(); // 停止当前倒计时
    timeRemaining = initialTime; // 重置时间
    updateDisplay(); // 更新显示
    startStopButton.textContent = 'Start'; // 更新按钮文本
}

// 绑定按钮事件
startStopButton.addEventListener('click', toggleCountdown);
resetButton.addEventListener('click', resetTimer);

// 初始化显示
updateDisplay();
