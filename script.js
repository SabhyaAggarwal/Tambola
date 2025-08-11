// Game Area Elements
const board = document.getElementById('board');
    const initialOptions = document.getElementById('initial-options');
    const gameArea = document.getElementById('game-area');
    const nextNumberButton = document.getElementById('nextNumberButton');
    const calledNumberDisplay = document.getElementById('called-number-display');
    const roomInfo = document.getElementById('room-info');
    const verifyButton = document.getElementById('verify-button');
    const resetButton = document.getElementById('reset-button');
    const rulesArea = document.getElementById('rules-area');

    // Modals
    const startGameModal = document.getElementById('start-game-modal');
    const joinGameModal = document.getElementById('join-game-modal');
    const claimModal = document.getElementById('claim-modal');

    // Modal Buttons
    const startGameButton = document.getElementById('start-game-button');
    const joinGameButton = document.getElementById('join-game-button');
    const joinRoomButton = document.getElementById('join-room-button');

    // Close Buttons
    const closeButtons = document.querySelectorAll('.close-button');

    // Start Game Modal Elements
    const startStep1 = document.getElementById('start-step-1');
    const startStep2 = document.getElementById('start-step-2');
    const startStep3 = document.getElementById('start-step-3');
    const roomNameInput = document.getElementById('room-name-input');
    const nextStep1Button = document.getElementById('next-step-1-button');
    const secondPersonNameInput = document.getElementById('second-person-name-input');
    const secondPersonPasswordInput = document.getElementById('second-person-password-input');
    const nextStep2Button = document.getElementById('next-step-2-button');
    const moneySwitch = document.getElementById('money-switch');
    const rulesListEditor = document.getElementById('rules-list-editor');
    const addRuleButton = document.getElementById('add-rule-button');
    const createRoomFinalizeButton = document.getElementById('create-room-finalize-button');

    // Join Game Modal Inputs
    const joinRoomNameInput = document.getElementById('join-room-name-input');

    // THIS WAS MISSING
    const claimModal = document.getElementById('claim-modal');
    const claimStep1 = document.getElementById('claim-step-1');
    const claimStep2 = document.getElementById('claim-step-2');
    const claimPassPrompt = document.getElementById('claim-pass-prompt');
    const claimPasswordInput = document.getElementById('claim-password-input');
    const claimSubmitPasswordButton = document.getElementById('claim-submit-password-button');
    const circlesContainer = document.getElementById('circles-container');
    const approveClaimButton = document.getElementById('approve-claim-button');
    const bogeyClaimButton = document.getElementById('bogey-claim-button');
    const hideCirclesButton = document.getElementById('hide-circles-button');

    // Game state
    let currentRoom = null;
    let isCreator = false;
    let ruleToClaim = null; // To keep track of the rule being verified
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
    startGameButton.addEventListener('click', () => {
        startStep1.classList.remove('hidden');
        startStep2.classList.add('hidden');
        startStep3.classList.add('hidden');
        roomNameInput.value = '';
        secondPersonNameInput.value = '';
        secondPersonPasswordInput.value = '';
        rulesListEditor.innerHTML = '';
        moneySwitch.checked = false;
        addRuleEditor(); // Add one rule by default
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

    nextStep2Button.addEventListener('click', () => {
        if (secondPersonNameInput.value.trim() && secondPersonPasswordInput.value.trim()) {
            startStep2.classList.add('hidden');
            startStep3.classList.remove('hidden');
        } else {
            alert("Please enter the second person's name and password.");
        }
    });

    addRuleButton.addEventListener('click', addRuleEditor);
    createRoomFinalizeButton.addEventListener('click', createRoom);
    moneySwitch.addEventListener('change', togglePriceInputs);
    joinRoomButton.addEventListener('click', joinRoom);
    nextNumberButton.addEventListener('click', callNumber);
    resetButton.addEventListener('click', resetGame);
    verifyButton.style.display = 'none'; // Hide original verify button

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

    function createRoom() {
        const roomName = roomNameInput.value.trim();
        if (localStorage.getItem(roomName)) {
            alert('Room with this name already exists!');
            return;
        }
        const rules = [];
        const ruleEditors = document.querySelectorAll('.rule-editor');
        for (const editor of ruleEditors) {
            const name = editor.querySelector('.rule-name-input').value.trim();
            if (!name) continue; // Ignore empty rules
            const price = editor.querySelector('.rule-price-input').value;
            rules.push({ name, price: moneySwitch.checked ? parseInt(price) || 0 : 0, claimedBy: null });
        }
        if (rules.length === 0) {
            alert('Please add at least one rule.');
            return;
        }
        const roomData = {
            isCreator: true,
            secondPersonName: secondPersonNameInput.value.trim(),
            secondPersonPassword: secondPersonPasswordInput.value.trim(),
            moneyEnabled: moneySwitch.checked,
            rules: rules,
            calledNumbers: []
        };
        localStorage.setItem(roomName, JSON.stringify(roomData));
        currentRoom = roomName;
        isCreator = true;
        startGameModal.classList.add('hidden');
        initialOptions.classList.add('hidden');
        gameArea.classList.remove('hidden');
        roomInfo.textContent = `Room: ${currentRoom}`;
        resetBoard();
        renderRules();
    }

    function joinRoom() {
        const roomName = joinRoomNameInput.value.trim();
        if (roomName && localStorage.getItem(roomName)) {
            currentRoom = roomName;
            isCreator = false; // Joined players are not creators
            joinGameModal.classList.add('hidden');
            initialOptions.classList.add('hidden');
            gameArea.classList.remove('hidden');
            roomInfo.textContent = `Room: ${currentRoom}`;
            loadGameState();
        } else {
            alert('Room not found!');
        }
    }

    function loadGameState() {
        const roomData = JSON.parse(localStorage.getItem(currentRoom));
        calledNumbers = roomData.calledNumbers;
        numbers = Array.from({ length: 90 }, (_, i) => i + 1).filter(n => !calledNumbers.includes(n));
        updateBoard();
        renderRules();
        if (calledNumbers.length > 0) {
            calledNumberDisplay.textContent = calledNumbers[calledNumbers.length - 1];
        }
    }

    function renderRules() {
        rulesArea.innerHTML = '';
        const roomData = JSON.parse(localStorage.getItem(currentRoom));
        if (!roomData || !roomData.rules) return;

        roomData.rules.forEach(rule => {
            const ruleDiv = document.createElement('div');
            ruleDiv.classList.add('rule-display');
            let ruleText = rule.name;
            if (roomData.moneyEnabled) {
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

    function handleClaimClick(event) {
        const ruleName = event.target.dataset.ruleName;
        ruleToClaim = ruleName;

        if (!isCreator) {
            alert(`You have initiated a claim for "${ruleName}". Please go to the creator's device to complete the verification.`);
            return;
        }

        // Creator's flow starts here
        const roomData = JSON.parse(localStorage.getItem(currentRoom));
        claimPassPrompt.textContent = `Pass the phone to ${roomData.secondPersonName}`;
        claimPasswordInput.value = '';
        claimStep1.classList.remove('hidden');
        claimStep2.classList.add('hidden');
        claimModal.classList.remove('hidden');
    }

    claimSubmitPasswordButton.addEventListener('click', () => {
        const roomData = JSON.parse(localStorage.getItem(currentRoom));
        if (claimPasswordInput.value === roomData.secondPersonPassword) {
            claimStep1.classList.add('hidden');
            claimStep2.classList.remove('hidden');
            approveClaimButton.disabled = true;
            bogeyClaimButton.disabled = true;
            claimWinnerPrompt.textContent = `Verify claim for: ${ruleToClaim}`;
            showCircles();
        } else {
            alert('Incorrect secret password!');
        }
    });

    hideCirclesButton.addEventListener('click', () => {
        circlesContainer.innerHTML = '';
        approveClaimButton.disabled = false;
        bogeyClaimButton.disabled = false;
        hideCirclesButton.classList.add('hidden');
    });

    approveClaimButton.addEventListener('click', () => {
        const winnerName = prompt(`Approving claim for "${ruleToClaim}".\nEnter the winner's name:`);
        if (winnerName && winnerName.trim()) {
            const roomData = JSON.parse(localStorage.getItem(currentRoom));
            const rule = roomData.rules.find(r => r.name === ruleToClaim);
            if (rule) {
                rule.claimedBy = winnerName.trim();
                localStorage.setItem(currentRoom, JSON.stringify(roomData));
                renderRules();
                claimModal.classList.add('hidden');
            }
        } else {
            alert("Winner's name cannot be empty.");
        }
    });

    bogeyClaimButton.addEventListener('click', () => {
        alert(`Claim for "${ruleToClaim}" has been rejected.`);
        claimModal.classList.add('hidden');
    });

    function showCircles() {
        circlesContainer.innerHTML = '';
        hideCirclesButton.classList.remove('hidden');
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
        if (roomData) {
            roomData.calledNumbers = [];
            localStorage.setItem(currentRoom, JSON.stringify(roomData));
        }
        updateBoard();
        calledNumberDisplay.textContent = '';
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

    // Hide the board initially
    board.style.display = 'none';
