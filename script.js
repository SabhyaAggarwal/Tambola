// --- Element Declarations ---
const board = document.getElementById('board');
const initialOptions = document.getElementById('initial-options');
const gameArea = document.getElementById('game-area');
const nextNumberButton = document.getElementById('nextNumberButton');
const calledNumberDisplay = document.getElementById('called-number-display');
const roomInfo = document.getElementById('room-info');
const verifyButton = document.getElementById('verify-button');
const resetButton = document.getElementById('reset-button');
const rulesArea = document.getElementById('rules-area');
const startGameModal = document.getElementById('start-game-modal');
const joinGameModal = document.getElementById('join-game-modal');
const claimModal = document.getElementById('claim-modal');
const startGameButton = document.getElementById('start-game-button');
const joinGameButton = document.getElementById('join-game-button');
const joinRoomButton = document.getElementById('join-room-button');
const closeButtons = document.querySelectorAll('.close-button');

// Start Game Modal Elements
const startStep1 = document.getElementById('start-step-1');
const startStep2 = document.getElementById('start-step-2');
const roomNameInput = document.getElementById('room-name-input');
const nextStep1Button = document.getElementById('next-step-1-button');
const moneySwitch = document.getElementById('money-switch');
const rulesListEditor = document.getElementById('rules-list-editor');
const addRuleButton = document.getElementById('add-rule-button');
const createRoomFinalizeButton = document.getElementById('create-room-finalize-button');

// Join Game Modal Inputs
const joinRoomNameInput = document.getElementById('join-room-name-input');

// Claim Modal Elements
const claimView = document.getElementById('claim-view');
const circlesContainer = document.getElementById('circles-container');
const claimWinnerPrompt = document.getElementById('claim-winner-prompt');
const approveClaimButton = document.getElementById('approve-claim-button');
const bogeyClaimButton = document.getElementById('bogey-claim-button');

// --- Game State ---
let currentRoom = null;
let isCreator = false;
let ruleToClaim = null;
let numbers = [];
let calledNumbers = [];
let socket = null;

// Initialize Socket.IO connection
if (typeof io !== 'undefined') {
    socket = io();
    
    // Socket event listeners
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    socket.on('number-called', (data) => {
        calledNumbers = data.calledNumbers;
        updateBoard();
        calledNumberDisplay.textContent = data.number;
    });
    
    socket.on('game-reset', (roomData) => {
        calledNumbers = roomData.calledNumbers;
        updateBoard();
        renderRules(roomData);
        calledNumberDisplay.textContent = '';
    });
    
    socket.on('rule-claimed', (data) => {
        renderRules(data.room);
    });
    
    socket.on('room-state', (roomData) => {
        loadGameStateFromServer(roomData);
    });
}

// --- Function Definitions ---
function addRuleEditor() {
    const ruleEditor = document.createElement('div');
    ruleEditor.classList.add('rule-editor');
    const ruleNameInput = document.createElement('input');
    ruleNameInput.type = 'text';
    ruleNameInput.placeholder = 'Rule Name (e.g., Full House)';
    ruleNameInput.classList.add('rule-name-input');
    const rulePriceInput = document.createElement('input');
    rulePriceInput.type = 'number';
    rulePriceInput.placeholder = 'Price';
    rulePriceInput.classList.add('rule-price-input');
    rulePriceInput.style.display = moneySwitch.checked ? 'inline-block' : 'none';
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.classList.add('remove-rule-button');
    removeButton.addEventListener('click', () => ruleEditor.remove());
    ruleEditor.appendChild(ruleNameInput);
    ruleEditor.appendChild(rulePriceInput);
    ruleEditor.appendChild(removeButton);
    rulesListEditor.appendChild(ruleEditor);
}

function togglePriceInputs() {
    const priceInputs = document.querySelectorAll('.rule-price-input');
    priceInputs.forEach(input => {
        input.style.display = moneySwitch.checked ? 'inline-block' : 'none';
    });
}

function handleClaimClick(event) {
    ruleToClaim = event.target.dataset.ruleName;

    if (!isCreator) {
        alert(`You have initiated a claim for "${ruleToClaim}". Please go to the creator's device to complete the verification.`);
        return;
    }

    // Creator's simplified flow
    claimWinnerPrompt.textContent = `Verify claim for: ${ruleToClaim}`;
    approveClaimButton.disabled = false;
    bogeyClaimButton.disabled = false;
    showCircles();
    claimModal.classList.remove('hidden');
}

function renderRules(roomData = null) {
    rulesArea.innerHTML = '';
    
    // If roomData is provided, use it; otherwise fetch from current room state
    const rules = roomData ? roomData.rules : [];
    const moneyEnabled = roomData ? roomData.moneyEnabled : false;
    
    if (!rules || rules.length === 0) return;
    
    rules.forEach(rule => {
        const ruleDiv = document.createElement('div');
        ruleDiv.classList.add('rule-display');
        let ruleText = rule.name;
        if (moneyEnabled) {
            ruleText += ` - $${rule.price}`;
        }
        if (rule.claimedBy) {
            ruleDiv.classList.add('claimed');
            ruleText += ` (Claimed by ${rule.claimedBy})`;
        }
        ruleDiv.textContent = ruleText;
        if (!rule.claimedBy) {
            const claimButton = document.createElement('button');
            claimButton.textContent = 'Claim';
            claimButton.classList.add('claim-button');
            claimButton.dataset.ruleName = rule.name;
            claimButton.addEventListener('click', handleClaimClick);
            ruleDiv.appendChild(claimButton);
        }
        rulesArea.appendChild(ruleDiv);
    });
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

function loadGameState() {
    if (!currentRoom) return;
    
    fetch(`/api/rooms/${currentRoom}`)
        .then(response => response.json())
        .then(roomData => {
            loadGameStateFromServer(roomData);
        })
        .catch(error => {
            console.error('Error loading game state:', error);
        });
}

function loadGameStateFromServer(roomData) {
    calledNumbers = roomData.calledNumbers || [];
    numbers = Array.from({ length: 90 }, (_, i) => i + 1).filter(n => !calledNumbers.includes(n));
    updateBoard();
    renderRules(roomData);
    if (calledNumbers.length > 0) {
        calledNumberDisplay.textContent = calledNumbers[calledNumbers.length - 1];
    }
}

function resetBoard() {
    if (!currentRoom) return;
    
    fetch(`/api/rooms/${currentRoom}/reset`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(roomData => {
        calledNumbers = [];
        numbers = Array.from({ length: 90 }, (_, i) => i + 1);
        updateBoard();
        renderRules(roomData);
        calledNumberDisplay.textContent = '';
    })
    .catch(error => {
        console.error('Error resetting game:', error);
        alert('Error resetting game. Please try again.');
    });
}

function createRoom() {
    const roomName = roomNameInput.value.trim();
    if (!roomName) {
        alert('Please enter a room name.');
        return;
    }
    
    const rules = [];
    const ruleEditors = document.querySelectorAll('.rule-editor');
    for (const editor of ruleEditors) {
        const name = editor.querySelector('.rule-name-input').value.trim();
        if (!name) continue;
        const price = editor.querySelector('.rule-price-input').value;
        rules.push({ name, price: moneySwitch.checked ? (parseInt(price) || 0) : 0, claimedBy: null });
    }
    if (rules.length === 0) {
        alert('Please add at least one rule.');
        return;
    }
    
    const roomData = {
        roomName: roomName,
        moneyEnabled: moneySwitch.checked,
        rules: rules
    };
    
    fetch('/api/rooms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(roomData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    })
    .then(responseData => {
        currentRoom = roomName;
        isCreator = true;
        startGameModal.classList.add('hidden');
        initialOptions.classList.add('hidden');
        gameArea.classList.remove('hidden');
        roomInfo.textContent = `Room: ${currentRoom}`;
        
        // Join the socket room
        if (socket) {
            socket.emit('join-room', currentRoom);
        }
        
        // Initialize game state
        calledNumbers = [];
        numbers = Array.from({ length: 90 }, (_, i) => i + 1);
        updateBoard();
        renderRules(responseData);
    })
    .catch(error => {
        console.error('Error creating room:', error);
        alert(error.error || 'Error creating room. Please try again.');
    });
}

function joinRoom() {
    const roomName = joinRoomNameInput.value.trim();
    if (!roomName) {
        alert('Please enter a room name.');
        return;
    }
    
    fetch(`/api/rooms/${roomName}/join`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    })
    .then(roomData => {
        currentRoom = roomName;
        isCreator = false;
        joinGameModal.classList.add('hidden');
        initialOptions.classList.add('hidden');
        gameArea.classList.remove('hidden');
        roomInfo.textContent = `Room: ${currentRoom}`;
        
        // Join the socket room
        if (socket) {
            socket.emit('join-room', currentRoom);
        }
        
        loadGameStateFromServer(roomData);
    })
    .catch(error => {
        console.error('Error joining room:', error);
        alert(error.error || 'Room not found!');
    });
}

function showCircles() {
    circlesContainer.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const circle = document.createElement('div');
        circle.classList.add('circle');
        circle.style.animationDelay = `${i * 0.2}s`;
        circlesContainer.appendChild(circle);
    }
}

function callNumber() {
    if (!isCreator) {
        alert("Only the room creator can draw numbers.");
        return;
    }
    if (numbers.length === 0) {
        calledNumberDisplay.textContent = 'Finished!';
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * numbers.length);
    const number = numbers[randomIndex];
    
    fetch(`/api/rooms/${currentRoom}/call-number`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ number })
    })
    .then(response => response.json())
    .then(roomData => {
        // The socket event will handle updating the UI
        numbers.splice(randomIndex, 1);
    })
    .catch(error => {
        console.error('Error calling number:', error);
        alert('Error calling number. Please try again.');
    });
}

function resetGame() {
    if (!isCreator) {
        alert("Only the room creator can reset the game.");
        return;
    }
    if (confirm('Are you sure you want to reset the game? This will clear all called numbers in this room.')) {
        resetBoard();
    }
}

// --- Event Listeners ---
startGameButton.addEventListener('click', () => {
    startStep1.classList.remove('hidden');
    startStep2.classList.add('hidden');
    roomNameInput.value = '';
    rulesListEditor.innerHTML = '';
    moneySwitch.checked = false;
    addRuleEditor();
    startGameModal.classList.remove('hidden');
});

joinGameButton.addEventListener('click', () => joinGameModal.classList.remove('hidden'));

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        startGameModal.classList.add('hidden');
        joinGameModal.classList.add('hidden');
        claimModal.classList.add('hidden');
    });
});

nextStep1Button.addEventListener('click', () => {
    if (roomNameInput.value.trim()) {
        startStep1.classList.add('hidden');
        startStep2.classList.remove('hidden');
    } else {
        alert('Please enter a room name.');
    }
});


addRuleButton.addEventListener('click', addRuleEditor);
createRoomFinalizeButton.addEventListener('click', createRoom);
moneySwitch.addEventListener('change', togglePriceInputs);
joinRoomButton.addEventListener('click', joinRoom);
nextNumberButton.addEventListener('click', callNumber);
resetButton.addEventListener('click', resetGame);
verifyButton.style.display = 'none';


approveClaimButton.addEventListener('click', () => {
    const winnerName = prompt(`Approving claim for "${ruleToClaim}".\nEnter the winner's name:`);
    if (winnerName && winnerName.trim()) {
        fetch(`/api/rooms/${currentRoom}/claim`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ruleName: ruleToClaim,
                winnerName: winnerName.trim(),
                approved: true
            })
        })
        .then(response => response.json())
        .then(roomData => {
            claimModal.classList.add('hidden');
            // The socket event will handle updating the UI
        })
        .catch(error => {
            console.error('Error approving claim:', error);
            alert('Error approving claim. Please try again.');
        });
    } else {
        alert("Winner's name cannot be empty.");
    }
});

bogeyClaimButton.addEventListener('click', () => {
    alert(`Claim for "${ruleToClaim}" has been rejected.`);
    claimModal.classList.add('hidden');
});

// --- Initial Setup ---
for (let i = 1; i <= 90; i++) {
    const cell = document.createElement('div');
    cell.classList.add('number-cell');
    cell.id = `cell-${i}`;
    cell.textContent = i;
    board.appendChild(cell);
}
board.style.display = 'none';
