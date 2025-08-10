document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const initialOptions = document.getElementById('initial-options');
    const gameArea = document.getElementById('game-area');
    const nextNumberButton = document.getElementById('nextNumberButton');
    const calledNumberDisplay = document.getElementById('called-number-display');
    const roomInfo = document.getElementById('room-info');
    const verifyButton = document.getElementById('verify-button');
    const resetButton = document.getElementById('reset-button');

    // Modals
    const startGameModal = document.getElementById('start-game-modal');
    const joinGameModal = document.getElementById('join-game-modal');
    const verifyModal = document.getElementById('verify-modal');

    // Modal Buttons
    const startGameButton = document.getElementById('start-game-button');
    const joinGameButton = document.getElementById('join-game-button');
    const createRoomButton = document.getElementById('create-room-button');
    const joinRoomButton = document.getElementById('join-room-button');
    const submitVerificationButton = document.getElementById('submit-verification-button');

    // Close Buttons
    const closeButtons = document.querySelectorAll('.close-button');

    // Inputs
    const roomNameInput = document.getElementById('room-name-input');
    const passwordInput = document.getElementById('password-input');
    const joinRoomNameInput = document.getElementById('join-room-name-input');
    const verifyPasswordInput = document.getElementById('verify-password-input');

    let currentRoom = null;
    let numbers = [];
    let calledNumbers = [];

    // Create the board
    for (let i = 1; i <= 90; i++) {
        const cell = document.createElement('div');
        cell.classList.add('number-cell');
        cell.id = `cell-${i}`;
        cell.textContent = i;
        board.appendChild(cell);
    }

    // Event Listeners
    startGameButton.addEventListener('click', () => startGameModal.classList.remove('hidden'));
    joinGameButton.addEventListener('click', () => joinGameModal.classList.remove('hidden'));
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            startGameModal.classList.add('hidden');
            joinGameModal.classList.add('hidden');
            verifyModal.classList.add('hidden');
        });
    });
    createRoomButton.addEventListener('click', createRoom);
    joinRoomButton.addEventListener('click', joinRoom);
    verifyButton.addEventListener('click', () => verifyModal.classList.remove('hidden'));
    submitVerificationButton.addEventListener('click', verifyPassword);
    nextNumberButton.addEventListener('click', callNumber);
    resetButton.addEventListener('click', resetGame);

    function createRoom() {
        const roomName = roomNameInput.value.trim();
        const password = passwordInput.value.trim();

        if (roomName && password) {
            if (localStorage.getItem(roomName)) {
                alert('Room with this name already exists!');
                return;
            }
            const roomData = {
                password: password,
                calledNumbers: []
            };
            localStorage.setItem(roomName, JSON.stringify(roomData));
            currentRoom = roomName;
            startGameModal.classList.add('hidden');
            initialOptions.classList.add('hidden');
            gameArea.classList.remove('hidden');
            roomInfo.textContent = `Room: ${currentRoom}`;
            resetBoard();
        } else {
            alert('Please enter a room name and password.');
        }
    }

    function joinRoom() {
        const roomName = joinRoomNameInput.value.trim();
        if (roomName && localStorage.getItem(roomName)) {
            currentRoom = roomName;
            joinGameModal.classList.add('hidden');
            initialOptions.classList.add('hidden');
            gameArea.classList.remove('hidden');
            roomInfo.textContent = `Room: ${currentRoom}`;
            loadGameState();
        } else {
            alert('Room not found!');
        }
    }

    function verifyPassword() {
        const password = verifyPasswordInput.value;
        const roomData = JSON.parse(localStorage.getItem(currentRoom));
        if (password === roomData.password) {
            verifyModal.classList.add('hidden');
            board.style.display = 'grid'; // Show the board
        } else {
            alert('Incorrect password!');
        }
    }

    function loadGameState() {
        const roomData = JSON.parse(localStorage.getItem(currentRoom));
        calledNumbers = roomData.calledNumbers;
        numbers = Array.from({ length: 90 }, (_, i) => i + 1).filter(n => !calledNumbers.includes(n));
        updateBoard();
        if (calledNumbers.length > 0) {
            calledNumberDisplay.textContent = calledNumbers[calledNumbers.length - 1];
        }
    }

    function callNumber() {
        if (numbers.length === 0) {
            calledNumberDisplay.textContent = 'Finished!';
            return;
        }

        const randomIndex = Math.floor(Math.random() * numbers.length);
        const number = numbers[randomIndex];

        numbers.splice(randomIndex, 1);
        calledNumbers.push(number);

        const roomData = JSON.parse(localStorage.getItem(currentRoom));
        roomData.calledNumbers = calledNumbers;
        localStorage.setItem(currentRoom, JSON.stringify(roomData));

        updateBoard();
        calledNumberDisplay.textContent = number;
    }

    function updateBoard() {
        const cells = document.querySelectorAll('.number-cell');
        cells.forEach(cell => {
            const num = parseInt(cell.textContent);
            if (calledNumbers.includes(num)) {
                cell.classList.add('called');
            } else {
                cell.classList.remove('called');
            }
        });
    }

    function resetBoard() {
        calledNumbers = [];
        numbers = Array.from({ length: 90 }, (_, i) => i + 1);
        const roomData = JSON.parse(localStorage.getItem(currentRoom));
        roomData.calledNumbers = [];
        localStorage.setItem(currentRoom, JSON.stringify(roomData));
        updateBoard();
        calledNumberDisplay.textContent = '';
    }

    function resetGame() {
        if (confirm('Are you sure you want to reset the game? This will clear all called numbers in this room.')) {
            resetBoard();
        }
    }

    // Hide the board initially
    board.style.display = 'none';
});
