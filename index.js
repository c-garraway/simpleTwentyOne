// API information
const startDrawURL = 'https://deckofcardsapi.com/api/deck/';
const endDrawURL = '/draw/?count=1';

const shuffleURL = 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1';

// needed page elements
const drawButton = document.querySelector('#drawButton');
const shuffleButton = document.querySelector('#reshuffleButton');
const holdButton = document.querySelector('#holdButton')
const globalMessageBox = document.querySelector('#messageBox');
const humanCardContainer = document.querySelector('#humanCardContainer');
const computerCardContainer = document.querySelector('#computerCardContainer');

const humanTotalBox = document.querySelector('#humanCardTotal');
const computerTotalBox = document.querySelector('#computerCardTotal');
const humanMessageBox = document.querySelector('#humanMessageBox');
const computerMessageBox = document.querySelector('#computerMessageBox');


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

// DeckOfCards API calls TODO: stream line drawCard method
class DeckOfCards {
    constructor() {
        this._baseURL = 'https://deckofcardsapi.com/api/deck/';
        this._drawEndURL = '/draw/?count=1';
        this._shuffle = 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1'
        this._reshuffleEndURL = '/shuffle/';
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
    drawCard = async (player) => {
        try {
            const endpoint = `${this.baseURL}${activeDeckID}${this.drawEndURL}`
            const response = await fetch(endpoint);
            if (response.ok) {
                const jsonResponse = await response.json();
                const card = jsonResponse.cards[0].image;
                const cardCode = jsonResponse.cards[0].code;
                console.log(`${player}, ${card}, ${cardCode}`);
                if(player === 'human') {
                    renderCard(card, 'human');
                    humanCards.push(cardCode);
                    const cardValue = determineCardValue(cardCode);
                    humanTotal += cardValue;
                    humanTotalBox.innerHTML = humanTotal;
                    humanBustLogic(humanTotal);
                    determineWinner();    
                } else {
                    renderCard(card, 'computer');
                    computerCards.push(cardCode);
                    const cardValue = determineCardValue(cardCode);
                    computerTotal += cardValue;
                    computerTotalBox.innerHTML = computerTotal;
                    computerHoldLogic(computerTotal);
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

const renderCard = (newCard, player) => {
    const img = document.createElement('img');
    img.src = newCard;
    img.style.padding = '5px';
    img.style.width = '25%';
    if (player === 'human') {
        humanCardContainer.appendChild(img);
        return;
    } else {
        computerCardContainer.appendChild(img)
        return;
    }
};

const determineCardValue = (code) => {
    let value;
    let first = code.charAt(0);
    console.log(first);
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
        computerMessageBox.innerHTML = 'Computer BUST!';
        computerMessageBox.style.color = 'red';
        computerBust = true;
        return;
    }
    if (diff < 6 && computerTotal >= humanTotal) {
        computerMessageBox.innerHTML = 'Computer HOLDS!';
        computerMessageBox.style.color = 'red';
        computerHolds = true;
        globalMessageBox.innerHTML = ' The computer holds! Press draw card button to draw a card.';

    }
};

const humanBustLogic = (currentTotal) => {
    if(currentTotal > 21) {
        humanBust = true;
        humanMessageBox.innerHTML = 'You BUST!';
        humanMessageBox.style.color = 'red';
    }
};
const determineWinner = () => {
    //TODO: finish function
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
    // TODO: Fix bug in this if block!
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

const renderWinner = (result) => {
    if(result === 'draw') {
        globalMessageBox.innerHTML = 'The game has ended in a draw!  Select new game to play again.'
    }
    else if (result === 'human') {
        globalMessageBox.innerHTML = 'Congratulations You Win! Select new game to play again.'
        humanMessageBox.innerHTML = 'WINNER!';
        humanMessageBox.style.color = 'red';

        

    } else {
        globalMessageBox.innerHTML = 'The Computer Wins! Select new game to play again.'
        computerMessageBox.innerHTML = 'WINNER';
        computerMessageBox.style.color = 'red';

    }
    drawButton.style.visibility = 'hidden';
    holdButton.style.visibility = 'hidden';
}

const reset = () => {
    humanCardContainer.innerHTML = '';
    computerCardContainer.innerHTML = '';
    humanTotalBox.innerHTML = 0;
    computerTotalBox.innerHTML = 0;
    humanTotal = 0;
    computerTotal = 0;
    drawButton.style.visibility = 'visible';
    holdButton.style.visibility = 'hidden';
    computerMessageBox.style.color = 'white';
    humanMessageBox.style.color = 'white';
    computerMessageBox.innerHTML = '...';
    humanMessageBox.innerHTML = '...';
    globalMessageBox.innerHTML = 'Press draw card to continue...';
    computerHolds = false;
    humanHolds = false;
    computerBust = false;
    humanBust = false;
    winner = '';
};

const human = new DeckOfCards();
const computer = new DeckOfCards();

shuffleButton.onclick = function() {
    if(activeDeckID) {
        human.reshuffleDeck();
    } 
    else {human.generateDeckId();
    }
    reset();
}

drawButton.onclick = function() {
    if (computerHolds) {
        human.drawCard('human');
    } else if (humanHolds) {
        computer.drawCard('computer');
        globalMessageBox.innerHTML = 'Press draw card button to draw for the computer';
    } else {
        human.drawCard('human');
        computer.drawCard('computer');
    } 
    holdButton.style.visibility = 'visible'; 
    globalMessageBox.innerHTML = 'Press draw card or hold to continue...';

    determineWinner();    
}

holdButton.onclick = function() {
    humanHolds = true;
    humanMessageBox.innerHTML = 'You HOLD!';
    humanMessageBox.style.color = 'red';
    determineWinner();
    if(winner === '') {
        globalMessageBox.innerHTML = 'Press draw card button to draw for the computer';
        console.log(winner);
        if(!computerHolds) {
            computer.drawCard('computer');
        }
    }
    
       
}