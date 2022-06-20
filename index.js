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
let delay = 0;
let wins = 0;
let draws = 0;
let losses = 0;

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
                    /* determineWinner(); */   
                } else {
                    renderCard(card, 'computer');
                    computerCards.push(cardCode);
                    const cardValue = determineCardValue(cardCode);
                    computerTotal += cardValue;
                    computerTotalBox.innerHTML = computerTotal;
                    computerHoldLogic(computerTotal);
                    /* determineWinner();   */  
                }
                if (isGameFinished) {
                    determineWinner();
                };
                
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

const isGameFinished = () => {
    let humanFinished;
    let computerFinished;
    if(humanBust === true || humanHolds === true) {
        humanFinished = true;
        console.log(humanFinished);
    }
    if(computerBust === true || computerHolds === true) {
        computerFinished = true;
        console.log(computerFinished);

    }
    if(humanFinished === true && computerFinished === true) {
        return true;
    } else {
        return false;
    }
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
        computerMessageBox.innerHTML = 'Computer is BUST!';
        computerMessageBox.style.color = 'yellow';
        computerBust = true;
        return;
    }
    if (diff < 6 && computerTotal >= humanTotal) {
        computerMessageBox.innerHTML = 'Computer HOLDS!';
        computerMessageBox.style.color = 'yellow';
        computerHolds = true;
        globalMessageBox.innerHTML = ' The computer holds! Press draw card button to draw a card.';
    }
};

const humanBustLogic = (currentTotal) => {
    if(currentTotal > 21) {
        humanBust = true;
        humanMessageBox.innerHTML = 'You are BUST!';
        humanMessageBox.style.color = 'yellow';
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

const renderWinner = (result) => {
    if(result === 'draw') {
        globalMessageBox.innerHTML = 'The game has ended in a draw!  Select new game to play again.'
        draws += 1;
        drawBox.innerHTML = draws;
    }
    else if (result === 'human') {
        globalMessageBox.style.color = 'yellow'
        globalMessageBox.innerHTML = 'Congratulations You Win! Enjoy this amazing dad joke as your prize.'
        humanMessageBox.innerHTML = 'WINNER!';
        humanMessageBox.style.color = 'yellow';
        wins += 1;
        winBox.innerHTML = wins;
        setTimeout(fetchPrize, delay);
    } else {
        globalMessageBox.innerHTML = 'The Computer Wins! Select new game to play again.'
        computerMessageBox.innerHTML = 'WINNER';
        computerMessageBox.style.color = 'yellow';
        console.log(losses);
        losses += 1;
        console.log(losses);
        lossBox.innerHTML = losses;
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
    prizeBox.style.display = 'none'
    computerMessageBox.style.color = 'white';
    humanMessageBox.style.color = 'white';
    computerMessageBox.innerHTML = 'round started';
    humanMessageBox.innerHTML = 'round started';
    globalMessageBox.style.color = 'white'
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
        setTimeout(function() {computer.drawCard('computer')}, delay);

        globalMessageBox.innerHTML = 'Press draw card button to draw for the computer';
    } else {
        human.drawCard('human');
        setTimeout(function() {computer.drawCard('computer')}, delay);
    } 
    holdButton.style.visibility = 'visible'; 
    globalMessageBox.innerHTML = 'Press draw card or hold to continue...';
    if (isGameFinished) {
        determineWinner();
    };   
}

holdButton.onclick = function() {
    humanHolds = true;
    humanMessageBox.innerHTML = 'You HOLD!';
    humanMessageBox.style.color = 'yellow';
    if (isGameFinished) {
        determineWinner();
    };
    if(winner === '') {
        globalMessageBox.innerHTML = 'Press draw card button to draw for the computer';
        console.log(winner);
        if(!computerHolds) {
            setTimeout(function() {computer.drawCard('computer')}, delay);
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
