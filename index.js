// API information
const startDrawURL = 'https://deckofcardsapi.com/api/deck/';
const endDrawURL = '/draw/?count=1';

const shuffleURL = 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1';

// needed page elements
const drawButton = document.querySelector('#drawButton');
const shuffleButton = document.querySelector('#reshuffleButton');
const holdButton = document.querySelector('#holdButton')

const humanCardContainer = document.querySelector('#humanCardContainer');
const computerCardContainer = document.querySelector('#computerCardContainer');

const humanTotalBox = document.querySelector('#humanCardTotal');
const computerTotalBox = document.querySelector('#computerCardTotal');
const humanMessageBox = document.querySelector('humanMessageBox');
const computerMessageBox = document.querySelector('#computerMessageBox');


let activeDeckID = '';
let deckShuffled = false;
let turn = 'human';
let humanTotal = 0;
let computerTotal = 0;
let humanCards = [];
let computerCards = [];
let computerHolds = false;
let humanHolds = false;

class deckOfCards {
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
                } else {
                    renderCard(card, 'computer');
                    computerCards.push(cardCode);
                    const cardValue = determineCardValue(cardCode);
                    computerTotal += cardValue;
                    computerTotalBox.innerHTML = computerTotal;
                    computerHoldLogic(computerTotal);
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
        computerMessageBox.innerHTML = 'Computer BUST!'
        computerMessageBox.style.color = 'red'
        return;
    }
    if (diff < 5) {
        computerMessageBox.innerHTML = 'Computer HOLDS!'
        computerMessageBox.style.color = 'red'

        computerHolds = true;
    }
};

const human = new deckOfCards();
const computer = new deckOfCards();

shuffleButton.onclick = function() {
    if(activeDeckID) {
        human.reshuffleDeck();
    } 
    else {human.generateDeckId();
    }
    humanCardContainer.innerHTML = '';
    computerCardContainer.innerHTML = '';
    humanTotalBox.innerHTML = 0;
    computerTotalBox.innerHTML = 0;
    humanTotal = 0;
    computerTotal = 0;
    drawButton.style.visibility = 'visible';
    holdButton.style.visibility = 'hidden';
    computerMessageBox.style.color = 'white'
    computerMessageBox.innerHTML = 'Computer Message Box';

    computerHolds = false;
    humanHolds = false;
}

drawButton.onclick = function() {
    if (computerHolds) {
        human.drawCard('human');
    } else {
        human.drawCard('human');
        computer.drawCard('computer');
    } 
    holdButton.style.visibility = 'visible';     
}

/* holdButton.onclick = function() {
    humanMessageBox.innerHTML = 'You HOLD!';
    humanMessageBox.style.color = 'red';
} */