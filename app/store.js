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