const expect = require("expect")
const reducers = require("../app/reducers.js")

describe("Reducer tests", () => {

    describe("mainReducer", () => {

        it("should start a new game", () => {
            const dispatch = _ => {}
            const state = {gameState: "INITIAL"}
            const action = {TYPE:"START"};
            const newState = reducers.mainReducer(state, dispatch, action, null)

            expect(state).toNotBe(newState)
            expect(newState.gameState).toEqual("RUNNING")
            expect(newState.deck).toExist()
            expect(newState.deck.length).toBe(52)
            expect(newState.winner).toBe("")
        })


    })

})