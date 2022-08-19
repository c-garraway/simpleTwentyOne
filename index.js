// needed page elements
const drawButton = document.querySelector('#drawButton');
const shuffleButton = document.querySelector('#reshuffleButton');
const holdButton = document.querySelector('#holdButton')
const globalMessageBox = document.querySelector('#globalMessageBox');
const humanCardContainer = document.querySelector('#humanCardContainer');
const computerCardContainer = document.querySelector('#computerCardContainer');
const humanTotalBox = document.querySelector('#humanCardTotal');
const computerTotalBox = document.querySelector('#computerCardTotal');
const humanMessageBox = document.querySelector('#humanMessageBox');
const computerMessageBox = document.querySelector('#computerMessageBox');
const prizeBox = document.querySelector('#prizeBox');
const winBox = document.querySelector('#wins');
const drawBox = document.querySelector('#draws');
const lossBox = document.querySelector('#losses');

let activeDeckID = '';
let deckShuffled = false;
let winner = '';
let humanTotal = 0;
let computerTotal = 0;
let humanCards = [];
let computerCards = [];
let computerHolds = false;
let humanHolds = false;
let computerBust = false;
let humanBust = false;
let delay = 500;
let wins = 0;
let draws = 0;
let losses = 0;
let humanFinished = false;
let computerFinished = false;
class DeckOfCards {
    constructor(name) {
        this._name = name;
        this._baseURL = 'https://deckofcardsapi.com/api/deck/';
        this._drawEndURL = '/draw/?count=1';
        this._shuffle = 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1'
        this._reshuffleEndURL = '/shuffle/';
    }
    get name() {
        return this._name
    }
    get baseURL() {
        return this._baseURL
    }
    get drawEndURL() {
        return this._drawEndURL
    }
    get shuffle() {
        return this._shuffle
    }
    get reshuffleEndURL() {
        return this._reshuffleEndURL
    }
    generateDeckId = async () => {
        try {
            const response = await fetch(this.shuffle);
            if (response.ok) {
                const jsonResponse = await response.json();
                activeDeckID = jsonResponse.deck_id;
                console.log(activeDeckID);
            }else {
                throw new Error('generateDeckId request failed!, no response.');
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    reshuffleDeck = async () => {
        try {
            const endpoint = `${this.baseURL}${activeDeckID}${this.reshuffleEndURL}`
            const response = await fetch(endpoint);
            if (response.ok) {
                const jsonResponse = await response.json();
                const shuffled = jsonResponse.shuffled;
                console.log(activeDeckID, shuffled);
            }else {
                throw new Error('reshuffleDeck request failed!, no response.');
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    
};
class Human extends DeckOfCards {
    constructor() {
        super('human')
    }
    drawCard = async () => {
        try {
            const endpoint = `${this.baseURL}${activeDeckID}${this.drawEndURL}`
            const response = await fetch(endpoint);
            if (response.ok) {
                const jsonResponse = await response.json();
                const card = jsonResponse.cards[0].image;
                const cardCode = jsonResponse.cards[0].code;
                console.log(`${this.name}, ${card}, ${cardCode}`);
                
                renderCard(card, this.name);
                humanCards.push(cardCode);
                const cardValue = determineCardValue(cardCode);
                humanTotal += cardValue;
                humanTotalBox.innerHTML = humanTotal;
                humanBustLogic(humanTotal);

                if(isComputerFinished) {
                    determineWinner();
                } 
                
            }else {
                throw new Error('drawCard request failed!, no response.');
            }
        }
        catch (error) {
            console.log(error);
        }
    }
}

class Computer extends DeckOfCards {
    constructor() {
        super('computer')
    }
    drawCard = async () => {
        try {
            const endpoint = `${this.baseURL}${activeDeckID}${this.drawEndURL}`
            const response = await fetch(endpoint);
            if (response.ok) {
                const jsonResponse = await response.json();
                const card = jsonResponse.cards[0].image;
                const cardCode = jsonResponse.cards[0].code;
                console.log(`${this.name}, ${card}, ${cardCode}`);
                
                renderCard(card, this.name);
                computerCards.push(cardCode);
                const cardValue = determineCardValue(cardCode);
                computerTotal += cardValue;
                computerTotalBox.innerHTML = computerTotal;
                computerHoldLogic(computerTotal);
                
                if(isHumanFinished) {
                    determineWinner();
                }  
            }else {
                throw new Error('drawCard request failed!, no response.');
            }
        }
        catch (error) {
            console.log(error);
        }
    }
}

const humanPlayer = new Human();
const computerPlayer = new Computer();

const isHumanFinished = () => {
    if(humanBust === true || humanHolds === true) {
        humanFinished = true;
        return humanFinished;
    };
};

const isComputerFinished = () => {
    if(computerBust === true || computerHolds === true) {
        computerFinished = true;
        return computerFinished;
    };
};

const renderCard = (newCard, player) => {
    const container = document.createElement('div');
    container.className = 'container';
    const img = document.createElement('img');
    img.src = newCard;
    img.style.width = '75px';
    img.className = 'card';
    if (player === 'human') {
        humanCardContainer.appendChild(container);
        container.appendChild(img);
        return;
    } else {
        computerCardContainer.appendChild(container);
        container.appendChild(img);
        return;
    }
};

const determineCardValue = (code) => {
    let value;
    let first = code.charAt(0);
    if (first === 'A') {
        value = 1;
    }
    else if (first === '0' || first === 'J' || first === 'Q' || first === 'K') {
        value = 10;
    } else {
        value = parseInt(first);
    }
    return value;
};

const computerHoldLogic = (currentTotal) => {
    const diff = 21 - currentTotal;
    if (currentTotal > 21) {
        computerMessageBox.innerHTML = 'Computer is BUST!';
        computerMessageBox.style.color = 'burlywood';
        computerBust = true;
        computerFinished = true;
        return;
    }
    if (diff < 6 && computerTotal >= humanTotal) {
        computerMessageBox.innerHTML = 'Computer HOLDS!';
        computerMessageBox.style.color = 'burlywood';
        computerHolds = true;
        computerFinished = true;
        globalMessageBox.innerHTML = ' The computer holds! Press draw card or hold button to continue.';
    }
};

const computerDrawLogic = () => {
    isComputerFinished();
    isHumanFinished();
    if (humanFinished === false && computerFinished === false) {
        setTimeout(computerPlayer.drawCard, delay);
    };
    if (humanFinished === true && computerFinished === false) {
        computerMessageBox.innerHTML = 'computer drawing...';
        computerMessageBox.style.color = 'burlywood'
        setTimeout(computerPlayer.drawCard, delay);
        computerBounce();
    }
}

const computerBounce = () => {
    setTimeout(computerDrawLogic, delay * 4);
}

const humanBustLogic = (currentTotal) => {
    if(currentTotal > 21) {
        humanBust = true;
        humanFinished = true;
        humanMessageBox.innerHTML = 'You are BUST!';
        humanMessageBox.style.color = 'burlywood';
    }
};

const determineWinner = () => {
    if(computerBust === true && humanBust === false) {
        renderWinner('human');
        winner = 'human';
    }
    else if(humanBust === true && computerBust === false) {
        renderWinner('computer');
        winner = 'computer';
    }
    else if(computerBust === true && humanBust === true) {
        renderWinner('draw');
        winner = 'draw';

    }
    else if(computerHolds === true && humanHolds === false) {
        if(humanTotal > computerTotal) {
            renderWinner('human');
            winner = 'human';
        }
    }
    else if(computerHolds === true && humanHolds === true) {
        if(humanTotal === computerTotal) {
            renderWinner('draw');
            winner = 'draw';
        }
        else if(humanTotal > computerTotal) {
            renderWinner('human');
            winner = 'human';

        } else {
            renderWinner('computer');
            winner = 'computer';
        }
    }
    else if(humanHolds === true && computerHolds === false) {
        if(computerTotal > humanTotal) {
            renderWinner('computer');
            winner = 'computer';
        }
    }
};

let renderWinnerComplete = false

const renderWinner = (result) => {
    if (renderWinnerComplete === false) {
        if(result === 'draw') {
            globalMessageBox.innerHTML = 'The game has ended in a draw!  Select new game to play again.'
            draws += 1;
            drawBox.innerHTML = draws;
            renderWinnerComplete = true;
        }
        else if (result === 'human') {
            globalMessageBox.innerHTML = 'Congratulations You Win! Enjoy this amazing dad joke as your prize.'
            humanMessageBox.innerHTML = 'WINNER!';
            humanMessageBox.style.color = 'burlywood';
            wins += 1;
            winBox.innerHTML = wins;
            setTimeout(fetchPrize, delay * 2);
            renderWinnerComplete = true;

        } else {
            globalMessageBox.innerHTML = 'The Computer Wins! Select new game to play again.'
            computerMessageBox.innerHTML = 'WINNER';
            computerMessageBox.style.color = 'burlywood';
            losses += 1;
            lossBox.innerHTML = losses;
            renderWinnerComplete = true;
        }
    }
    drawButton.setAttribute('disabled', '');
    holdButton.setAttribute('disabled', '');
}

const reset = () => {
    humanCardContainer.innerHTML = '';
    computerCardContainer.innerHTML = '';
    humanTotalBox.innerHTML = 0;
    computerTotalBox.innerHTML = 0;
    humanTotal = 0;
    computerTotal = 0;
    drawButton.removeAttribute('disabled');
    holdButton.setAttribute('disabled', '');
    prizeBox.style.display = 'none'
    computerMessageBox.style.color = 'white';
    humanMessageBox.style.color = 'white';
    computerMessageBox.innerHTML = 'round started';
    humanMessageBox.innerHTML = 'round started';
    globalMessageBox.innerHTML = 'Press draw card to continue...';
    computerHolds = false;
    humanHolds = false;
    computerBust = false;
    humanBust = false;
    winner = '';
    humanFinished = false;
    computerFinished = false;
    renderWinnerComplete = false;
};

shuffleButton.onclick = function() {
    if(activeDeckID) {
        humanPlayer.reshuffleDeck();
    } 
    else {humanPlayer.generateDeckId();
    }
    reset();
}

drawButton.onclick = function() {
    if (computerHolds) {
        humanPlayer.drawCard();
    } else {
        humanPlayer.drawCard();
        computerDrawLogic();
    } 
    holdButton.removeAttribute('disabled');; 
    globalMessageBox.innerHTML = 'Press draw card or hold to continue...';
}

holdButton.onclick = function() {
    humanHolds = true;
    humanFinished = true;
    humanMessageBox.innerHTML = 'You HOLD!';
    humanMessageBox.style.color = 'burlywood';
    holdButton.setAttribute('disabled', '');
    drawButton.setAttribute('disabled', '');
    if (isComputerFinished) {
        determineWinner();
    };
    if(winner === '') {
        if(!computerHolds) {
            computerDrawLogic();
        }
    }   
}

const fetchPrize = async () => {
    const url = 'https://icanhazdadjoke.com';
    try {
        const response = await fetch(url, {
            headers: {
                Accept: "application/json",
            },
        });
        if (response.ok) {
            const jsonResponse = await response.json();
            prizeBox.innerHTML = jsonResponse.joke;
            prizeBox.style.display = 'block';
        } else {
            throw new Error('fetchPrize request failed!');
        }
    }
    catch (error) {
        console.log(error);
    }
}
