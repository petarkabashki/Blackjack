const util = require("../app/util.js")
const expect = require("expect")

describe("Util tests", () => {

    it("newDeck should create a new deck", () => {

        const deck = util.newDeck()

        expect(deck.length).toBe(52)
    })


    it("drawCard should draw a card from a deck", () => {

        const deck = util.newDeck();
        const draw = util.drawCard(deck)

        expect(draw.deck.length).toBe(51)
        expect(draw.card).toExist();
    })

})