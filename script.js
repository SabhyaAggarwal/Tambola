document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const startButton = document.getElementById('startButton');
    const nextNumberButton = document.getElementById('nextNumberButton');
    const calledNumberDisplay = document.getElementById('called-number-display');

    let numbers = Array.from({ length: 90 }, (_, i) => i + 1);
    let calledNumbers = [];

    // Create the board
    for (let i = 1; i <= 90; i++) {
        const circle = document.createElement('div');
        circle.classList.add('circle');
        circle.id = `circle-${i}`;
        circle.textContent = i;
        board.appendChild(circle);
    }

    startButton.addEventListener('click', startGame);
    nextNumberButton.addEventListener('click', callNumber);

    function startGame() {
        startButton.classList.add('hidden');
        nextNumberButton.classList.remove('hidden');
        calledNumberDisplay.classList.remove('hidden');

        // Reset board for subsequent games
        if (calledNumbers.length === 90) {
            resetGame();
        }
    }

    function callNumber() {
        if (numbers.length === 0) {
            nextNumberButton.classList.add('hidden');
            calledNumberDisplay.textContent = 'Finished!';
            const restartButton = document.createElement('button');
            restartButton.textContent = 'Want to start again?';
            restartButton.addEventListener('click', () => {
                location.reload(); // Simple way to restart
            });
            document.getElementById('header').appendChild(restartButton);
            return;
        }

        const randomIndex = Math.floor(Math.random() * numbers.length);
        const number = numbers[randomIndex];

        numbers.splice(randomIndex, 1);
        calledNumbers.push(number);

        // Update UI
        const circle = document.getElementById(`circle-${number}`);
        circle.classList.add('called');
        calledNumberDisplay.textContent = number;

        // Speak the number
        speak(number);
    }

    function speak(number) {
        const utterance = new SpeechSynthesisUtterance(number.toString());
        speechSynthesis.speak(utterance);
    }

    function resetGame() {
        numbers = Array.from({ length: 90 }, (_, i) => i + 1);
        calledNumbers = [];
        const circles = document.querySelectorAll('.circle');
        circles.forEach(c => c.classList.remove('called'));
        calledNumberDisplay.textContent = '';
        calledNumberDisplay.classList.add('hidden');
        nextNumberButton.classList.add('hidden');
        startButton.classList.remove('hidden');
        const restartButton = document.querySelector('#header button:not(#startButton):not(#nextNumberButton)');
        if (restartButton) {
            restartButton.remove();
        }
    }
});
