document.querySelector(".game").classList.toggle("game-hidden");
let squares = document.querySelectorAll(".square");
console.log(squares);

let socket;
let game;
let isMyTurn = false;
function setup() {
  socket = io("http://localhost:3000", {
    withCredentials: false,
    extraHeaders: {
      "Access-Control-Allow-Credentials": "true",
    },
  });

  socket.on("gameStart", (data) => {
    game = data.filter((singleGame) =>
      singleGame.playerNames.includes(myNickname)
    );
    document.querySelector(".game").classList.toggle("game-hidden");
    document.querySelector(".starter").classList.toggle("starter-hidden");
    document.querySelector(".submitinput").classList.toggle("starter-hidden");

    squares.forEach((el) => {
      mappedColors.push({
        id: el.id,
        hiddenColor: doubledColors[randomUniqueNumbers[el.id]],
      });
      console.log("nick", myNickname);
      console.log("turka", game[0].turn);
      if (game[0].turn === myNickname) {
        console.log("kolorki", mappedColors);
        el.addEventListener(
          "click",
          showColor.bind(null, mappedColors[el.id].hiddenColor)
        );
      }
    });

    squares.forEach((sq) => {
      if (game[0].showedSquares.includes(sq.id * 1) == false)
        document.getElementById(sq.id).classList.toggle("square-hidden");
    });

    console.log(game);
  });

  socket.on("gameStateUpdate", (data) => {
    game = data.filter((singleGame) =>
      singleGame.playerNames.includes(myNickname)
    );
    if (game[0].turn !== myNickname) {
      console.log("TURAUPDATE", game[0].turn);
      console.log("NICK UPDATE", myNickname);
      isMyTurn = false;
      //block all event listeners
      // squares = squares.map((el) => el.removeEventListener("click", showColor));
      squares.forEach((oldEl) => {
        oldEl.parentNode.replaceChild(oldEl.cloneNode(true), oldEl);
      });
    } else {
      resetSquaresColor();
      isMyTurn = true;
      squares = document.querySelectorAll(".square");
      squares.forEach((el) =>
        el.addEventListener(
          "click",
          showColor.bind(this, mappedColors[el.id].hiddenColor)
        )
      );
      console.log("UPD", squares);
    }

    console.log("UPDEJCIK");
    console.log(game);

    squares.forEach((sq) => {
      // console.log(sq.id);
      // console.log(game[0].showedSquares.includes(sq.id * 1));
      if (game[0].showedSquares.includes(sq.id * 1) == false)
        document.getElementById(sq.id).classList.toggle("square-hidden");
      // console.log(document.getElementById(sq.id));
    });
  });

  // io.sockets.emit("gameStateUpdate", games);
}

window.onload = setup;

let revealedAmount = 0;

let lastRevealedColor = "";
let lastRevealedSquare = -1;
let myNickname = "";

let points = 0;
document.querySelector(".my-points").innerHTML = points;

const joinQueue = (event) => {
  myNickname = document.querySelector(".starter-input").value;
  document.querySelector(".starter-input").classList.toggle("starter-hidden");
  document.querySelector(".info").innerHTML = "Czekanie na drugiego gracza";

  console.log("testQq");
  console.log(socket);
  socket.emit("joinQueue", { myNickname });
};

const colors = [
  "white",
  "red",
  "blue",
  "yellow",
  "green",
  "purple",
  "orange",
  "pink",
  "brown",
  "orangered",
  "cyan",
  "lightgreen",
];
const doubledColors = colors.concat(colors);

const resetSquaresColor = () => {
  squares.forEach((square) => (square.style.backgroundColor = "black"));
};

const getRandomWithoutRepetition = () => {
  const fields = Array.from(Array(24).keys());
  console.log(doubledColors);
  ranNums = [];
  i = fields.length;
  let num = 0;
  while (i--) {
    num = Math.floor(Math.random() * (i + 1));
    ranNums.push(fields[num]);
    fields.splice(num, 1);
  }

  return ranNums;
};

const randomUniqueNumbers = getRandomWithoutRepetition();

const showColor = (color, event) => {
  revealedAmount++;

  let backup;
  console.log(revealedAmount);
  console.log("obecny", color);
  console.log("prev", lastRevealedColor);
  console.log("prev", event.target);
  console.log("prev", lastRevealedSquare);
  let isCorrect = false;
  if (color === lastRevealedColor && event.target != lastRevealedSquare) {
    event.target.removeEventListener("click", showColor);
    lastRevealedSquare.removeEventListener("click", showColor);

    isCorrect = true;
    //event socketowy
    points += 1;
    document.querySelector(".my-points").innerHTML = points;
    event.target.classList.toggle("square-hidden");
    lastRevealedSquare.classList.toggle("square-hidden");
  }

  if (revealedAmount == 2) {
    revealedAmount = 0;
    console.log("PRZEKAZANIE RUCHU Z WYNIKIEM", isCorrect);
    socket.emit("nextMove", {
      myNickname,
      firstFieldId: event.target.id * 1,
      secFieldId: lastRevealedSquare.id * 1,
      isCorrect: isCorrect,
    });
    lastRevealedSquare = event.target;
    lastRevealedColor = color;
    backup = event.target;
    // resetSquaresColor();
  }

  event.target.style.backgroundColor = color;
};

const mappedColors = [];

// socket = console.log(mappedColors);
// object.addEventListener("click", myScript);
