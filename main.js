// 放在文件最上方
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
};

const Symbols = [
  "https://image.flaticon.com/icons/svg/105/105223.svg", // 黑桃
  "https://image.flaticon.com/icons/svg/105/105220.svg", // 愛心
  "https://image.flaticon.com/icons/svg/105/105212.svg", // 方塊
  "https://image.flaticon.com/icons/svg/105/105219.svg", // 梅花
];

const view = {
  // anything related to interface

  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];
    return `
        <p>${number}</p>
        <img src=${symbol} />
        <p>${number}</p>
    `;
  },
  getCardElement(index) {
    return `<div class="card back" data-index='${index}'>
      </div>
    `;
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },
  displayCards(indexes) {
    const rootElement = document.querySelector("#cards");
    rootElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join("");
  },
  flipCards(...cards) {
    cards.forEach((card) => {
      //if back, retrun front
      if (card.classList.contains("back")) {
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
        return;
      }

      //if front, retrun back
      card.classList.add("back");
      card.innerHTML = null;
    });
  },
  pairCards(...cards) {
    cards.forEach((card) => {
      card.classList.add("paired");
    });
  },
  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },
  renderTriedTimes(triedTimes) {
    document.querySelector(
      ".tried"
    ).textContent = `You've tried: ${triedTimes} times`;
  },
  appendWrongAnimation(...cards) {
    cards.forEach((card) => {
      card.classList.add("wrong");
      card.addEventListener("animationend", (event) => {
        event.target.classList.remove("wrong"), { once: true };
      });
    });
  },
  showGameFinished() {
    const div = document.createElement("div");
    div.classList.add("completed");
    div.innerHTML = `<p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>`;

    const header = document.querySelector("#header");
    header.before(div);
  },
};

const controller = {
  //initial state
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandromNumberArray(52));
  },

  dispatchedCardAction(card) {
    if (!card.classList.contains("back")) {
      return;
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card);
        model.revealedCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes);
        view.flipCards(card);
        model.revealedCards.push(card);
        //判斷是否配對成功
        if (model.isRevealedCardMatched()) {
          view.renderScore((model.score += 10));
          this.currentState = GAME_STATE.CardsMatched;
          view.pairCards(...model.revealedCards);
          model.clearRevealedCard();

          //finish game when score match 260
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished();
            return;
          }
        } else {
          view.appendWrongAnimation(...model.revealedCards);
          this.currentState = GAME_STATE.CardsMatchFailed;
          setTimeout(this.resetCards, 1000);
        }
        this.currentState = GAME_STATE.FirstCardAwaits;
        break;
    }
  },

  resetCards() {
    view.flipCards(...model.revealedCards);
    model.clearRevealedCard();
  },
};

const model = {
  //temp array that store two card which been revealed, once you confirm if it match or not, then you can clear this out
  revealedCards: [],
  score: 0,
  triedTimes: 0,

  isRevealedCardMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    );
  },

  clearRevealedCard() {
    this.revealedCards = [];
  },
};

const utility = {
  // anything from external library

  //provide a count and generate a number array
  getRandromNumberArray(count) {
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index],
      ];
    }
    return number;
  },
};

//render all cards
controller.generateCards();

//add eventlistner to all cards
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", (e) => {
    controller.dispatchedCardAction(card);
  });
});
