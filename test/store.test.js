const expect = require("expect")
const Store = require("../app/store.js")

describe("Store tests", (done) => {

    it("should create initial state", () => {

        const store = new Store()
        store.dispatch({TYPE: "INITIALIZE"}, _ => {
            const state = store.getState()
            expect(state.gameState).toBe("INITIAL")
            done();
        })

    })


    it("should dispatch actions", () => {

        const store = new Store()
        const action = {}

        store.dispatch(action)
    })
})