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
