(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
"use strict"

const Store = require("./store");
const Renderer = require("./renderer")

const store = new Store()
const renderer = new Renderer(document.getElementById("main"), store.dispatch)

store.subscribe(renderer)
store.dispatch({TYPE: "INITIALIZE"})

},{"./renderer":5,"./store":6}],3:[function(require,module,exports){
"use strict"

function createButton(document, id, classes, text){
    const btn = document.createElement("button")
    btn.className = classes;
    btn.id = id;
    btn.innerText = text;
    return btn;
}

function createCard(document, card){
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    cardEl.innerHTML = `<span class='suit ${card.suit}'>${card.suit}</span>${card.rank == "10" ? "10" : card.rank[0]}`;
    return cardEl;
}


module.exports = class MainComponent {
    render(parent, state, dispatch){

        const html = `
            <div class="header">
                <h2>Blackjack</h2>
            </div>
            <div id="table">
                <div class="bank">
                    <h4>Bank</h4>
                    <div class="hand bank-hand">
                    </div>
                </div>
                ${ state.winner ? " <h3 class='msg'>WINNER: " + state.winner + "</h3>" : "" }
                <div class="player" >
                    <div class="hand player-hand">
                    </div>
                    <h4>You</h4>
                </div>
            </div>
            <div id="btnGroup" class="btn-group clear-both">

            </div>
        `;

        const element = document.createElement("div")
        element.className = "game";
        element.innerHTML = html;

        const btnGroup = element.getElementsByClassName("btn-group")[0]
        const playerHand = element.getElementsByClassName("player-hand")[0]
        const bankHand = element.getElementsByClassName("bank-hand")[0]

        if(state.gameState !== "INITIAL") {
            state.playerHand.forEach(card => playerHand.appendChild(createCard(document, card)));
            state.bankHand.forEach(card => bankHand.appendChild(createCard(document, card)));
        }

        btnGroup.addEventListener("click", event => {
            switch(event.srcElement.id) {
                case "btnNewGame":
                    dispatch({TYPE: "START" })
                    break;
                case "btnHit":
                    dispatch({TYPE: "PLAYER HIT" })
                    break;
                case "btnStick":
                    dispatch({TYPE: "PLAYER STICK" })
                    break;
                default:
                    break;
            }
        });

        switch (state.gameState) {
            case "INITIAL":
            case "FINISHED":
                const btnNewGame = createButton(document, "btnNewGame", "btn-new-game", "START NEW GAME")
                btnGroup.appendChild(btnNewGame);
                break;
            case "PLAYER THINKING":
                const btnHit = createButton(document, "btnHit", "btn-hit", "PLAYER HIT")
                btnGroup.appendChild(btnHit);

                const btnStick = createButton(document, "btnStick", "btn-stick", "PLAYER STICK")
                btnGroup.appendChild(btnStick);
            default:
                break
        }

        parent.innerHTML = ""
        parent.appendChild(element)

    }
}
},{}],4:[function(require,module,exports){
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
},{"./util":7}],5:[function(require,module,exports){
"use strict"

const MainComponent = require("./components/MainComponent")

module.exports = class Renderer{
    constructor(container, dispatch){
        this._container = container
        this._dispatch = dispatch
    }

    notify(state) {
        this.render(state)
    }

    render(state){
        const mainComponent = new MainComponent()

        mainComponent.render(this._container, state, this._dispatch);
    }
}
},{"./components/MainComponent":3}],6:[function(require,module,exports){
(function (process){
"use strict"

const reducers = require("./reducers")

module.exports = class Store {
    constructor(){
        const subscribers = []
        var state = {};

        const me = this
        this.dispatch = (action, done) =>
        {
            setTimeout(() => {

                if (process.browser) {
                    console.log("BEFORE STATE: ", state)
                    console.log("ACTION: ", action)
                }

                state = reducers.mainReducer(state, function(actn){ me.dispatch(actn) }, action)
                if(done) {done()}


                if (process.browser) {
                    console.log("AFTER STATE: ", state)
                }

                subscribers.forEach(s => {
                        setTimeout(() => s.notify(state))
                });

            })


        }

        this.subscribe = (subscriber) => {
            subscribers.push(subscriber)
        }

        this.getState = () => {
            return Object.assign({},state)
        }
    }
}
}).call(this,require('_process'))
},{"./reducers":4,"_process":1}],7:[function(require,module,exports){
"use strict"

var exports = module.exports = {}

const suits = ['♣', '♦', '♥', '♠' ];
const ranks = Array.apply(null, Array(13)).map((x,i) => i+1).map(rawValue => {
    switch(rawValue){
        case 1:
            return {value: 11, rank: "ace"}
            break;
        case 11:
            return {value: 10, rank: "jack"}
            break;
        case 12:
            return {value: 10, rank: "queen"}
            break;
        case 13:
            return {value: 10, rank: "king"}
            break;
        default:
            return {value: rawValue, rank: rawValue.toString()}
            break
    }
});

const deck = [].concat.apply([], suits.map(s => ranks.map(r => Object.assign({},r,{suit: s} ) ) ) );

exports.newDeck = function(){
    return [...deck];
}


exports.drawCard = function(deck){
    const ind = Math.floor(Math.random() * deck.length);
    const card = deck[ind];
    const resDeck = deck.filter((x, i) => i != ind);
    return {card: card, deck: resDeck};
}

function genAceCombinations(n){
    const res = [];
    var i;
    for(i = 0; i <= n; i++) {
        res.push(i * 1 + (n - i) * 11);
    }
    return res;
}

exports.genAceCombinations = genAceCombinations;

exports.possibleHandSums = function(hand){
    let aces = hand.filter(card => card.rank == "ace").length;
    const nonAces = hand.filter(card => card.rank != "ace" );

    //generate combination values for aces
    var aceCombinations = genAceCombinations(aces);

    const nonAceSum = nonAces.reduce((c1, c2) => c1 + c2.value, 0);
    //all the possible sums
    const possibleValues = aceCombinations.map(x => x + nonAceSum);

    return possibleValues;
}

//------------------------21---------------------
//----------------x------------y-----------------
//---------z------------------------w------------
exports.bestHandSum = function(possibleValues){
    var curr, best;
    possibleValues.forEach(curr => {
            if(best === undefined){
            best = curr;
        } else if(best <= 21 && curr <= 21){
            best = Math.max(best,curr);
        } else {
            best = Math.min(best,curr);
        }
    });

    return best;
}

},{}]},{},[2]);
