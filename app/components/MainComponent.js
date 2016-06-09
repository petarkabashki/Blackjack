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