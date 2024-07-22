document.addEventListener('DOMContentLoaded', (event) => {
    let countdown;
    let isCounting = false;

    const timerDisplay = document.querySelector('#timer');
    const startStopButton = document.querySelector('#startStopButton');
    const resetButton = document.querySelector('#resetButton');

    const initialTime = 90 * 60; // 90 minutes in seconds
    let remainingTime = initialTime;

    function displayTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const sec = seconds % 60;
        timerDisplay.innerHTML = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    function startCountdown() {
        const now = Date.now();
        const then = now + remainingTime * 1000;
        displayTime(remainingTime);

        countdown = setInterval(() => {
            remainingTime = Math.round((then - Date.now()) / 1000);
            if (remainingTime <= 0) {
                clearInterval(countdown);
                isCounting = false;
                remainingTime = 0;
                displayTime(remainingTime);
                startStopButton.textContent = 'Start';
                alert('倒计时结束！'); // 显示倒计时结束消息
            } else {
                displayTime(remainingTime);
            }
        }, 1000);
    }

    function toggleCountdown() {
        if (isCounting) {
            clearInterval(countdown);
            isCounting = false;
            startStopButton.textContent = 'Start';
        } else {
            startCountdown();
            isCounting = true;
            startStopButton.textContent = 'Stop';
        }
    }

    function resetCountdown() {
        clearInterval(countdown);
        isCounting = false;
        remainingTime = initialTime;
        displayTime(remainingTime);
        startStopButton.textContent = 'Start';
    }

    startStopButton.addEventListener('click', toggleCountdown);
    resetButton.addEventListener('click', resetCountdown);

    // Initialize the display
    displayTime(initialTime);
});
