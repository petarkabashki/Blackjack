"use strict"

const util = require('./util'),
    newDeck = util.newDeck,
    drawCard = util.drawCard,
    genAceCombinations = util.genAceCombinations,
    possibleHandSums = util.possibleHandSums,
    bestHandSum = util.bestHandSum;

var exports = module.exports = {};

exports.mainReducer = mainReducer;


function mainReducer(state, dispatch, action) {
    var newState = state;

    if (!action) {
        return Object.assign({}, state);
    }

    switch (action.TYPE) {

        case "INITIALIZE":
            return Object.assign({}, {gameState: "INITIAL"})
            break;
        case "START":
            return startNewGame(state, dispatch);
            break;

        case "BANK HIT":
            return bankHit(state,dispatch)
            break;

        case "PLAYER HIT":
            return playerHit(state,dispatch)
            break;

        case "PLAYER STICK":
        case "BANK HITTING":
            return bankHitting(state,dispatch)
            break;

        case "PLAYER THINKING":
            return Object.assign({}, state, {gameState: "PLAYER THINKING"})

        default:
            return state;
    }
}

function bankHitting(state,dispatch){
    const newState = bankHit(state,dispatch);
    newState.gameState = "BANK HITTING";

    if(newState.bestBankSum > 21){
        newState.winner = "player"
        newState.gameState = "FINISHED"
    } else if(state.gameState == "BANK HITTING" && newState.bestBankSum >= 17){
        if(newState.bestBankSum > newState.bestPlayerSum) {
            newState.winner = "bank"
            newState.gameState = "FINISHED"
        } else  if(newState.bestBankSum < newState.bestPlayerSum){
            newState.winner = "player"
            newState.gameState = "FINISHED"
        } else {
            newState.winner = "NONE, scores are equal"
            newState.gameState = "FINISHED"
        }
    } else {
        setTimeout(() => dispatch({TYPE: "BANK HITTING"}) , 500)
    }

    return newState;
}

function startNewGame(state,dispatch){
    setTimeout( () => {
        dispatch({TYPE: "PLAYER HIT"});
        setTimeout(() => {
            dispatch({TYPE: "PLAYER HIT"});

            setTimeout(() => {
                dispatch({TYPE: "BANK HIT"});

                setTimeout(() => {
                    dispatch({TYPE: "PLAYER THINKING"});
                },500);

            },500);

        },500);

    },500);

    const newState = Object.assign({}, state, {
        gameState: "RUNNING",
        winner: "",
        deck: newDeck(),
        bankHand: [],
        playerHand: []
    });

    return newState;
}

function playerHit(state,dispatch){
    const playerDraw = drawCard(state.deck);
    const newPlayerHand = [...state.playerHand, playerDraw.card];
    const possiblePlayerSums = possibleHandSums(newPlayerHand);
    const bestPlayerSum = bestHandSum(possiblePlayerSums);
    const newState = Object.assign({}, state, {
        deck: playerDraw.deck,
        playerHand: newPlayerHand,
        bestPlayerSum: bestPlayerSum,
        playerSums: possiblePlayerSums
    });
    if(bestPlayerSum > 21) {
        newState.winner = "bank";
        newState.gameState = "FINISHED"
    }
    return newState;
}


function bankHit(state,dispatch) {
    const bankDraw = drawCard(state.deck);
    const newBankHand = [...state.bankHand, bankDraw.card];
    const possibleBankSums = possibleHandSums(newBankHand);
    const bestBankSum = bestHandSum(possibleBankSums);
    const newState = Object.assign({}, state, {
        deck: bankDraw.deck,
        bankHand: newBankHand,
        bankSums: possibleBankSums,
        bestBankSum: bestBankSum
    });

    return newState;
}