document.querySelector(".game").classList.toggle("game-hidden");
let squares = document.querySelectorAll(".square");

let socket;
let game;
let isMyTurn = false;

const reload = () => window.location.reload();

const resetSquaresColor = () => {
  squares.forEach((square) => (square.style.backgroundColor = "black"));
};

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

    whoseTurn();

    squares.forEach((el) => {
      mappedColors.push({
        id: el.id,
        hiddenColor: doubledColors[game[0].trueColors[el.id]],
      });
      if (game[0].turn === myNickname) {
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

    // console.log(game);
  });

  socket.on("gameEnd", (data) => {
    squares.forEach((sq) => {
      if (!document.getElementById(sq.id).classList.contains("square-hidden"))
        document.getElementById(sq.id).classList.toggle("square-hidden");
    });

    document.querySelector(".game-state").innerHTML =
      data.winner == "remis"
        ? "Remis"
        : data.winner == myNickname
        ? "Wygrałeś"
        : "Przegrałeś";

    if (data.wantedGame.turn == myNickname) {
      let enemyPoints = document.querySelector(".enemy-points").innerHTML;
      enemyPoints = enemyPoints*1 + 1;
      document.querySelector(".enemy-points").innerHTML = enemyPoints;
    }

    document.querySelector(".reload").classList.toggle("hidden");
  });

  socket.on("gameStateUpdate", (data) => {
    game = data.filter((singleGame) =>
      singleGame.playerNames.includes(myNickname)
    );

    whoseTurn();

    if (game[0].p0.nickname === myNickname) {
      document.querySelector(".my-points").innerHTML = game[0].p0.points;
      document.querySelector(".enemy-points").innerHTML = game[0].p1.points;
    } else {
      document.querySelector(".my-points").innerHTML = game[0].p1.points;
      document.querySelector(".enemy-points").innerHTML = game[0].p0.points;
    }

    squares.forEach((square) => {
      document.getElementById(square.id).style.backgroundColor = "black";
    });
    document.getElementById(game[0].lastMoves[0]).style.backgroundColor =
      mappedColors[game[0].lastMoves[0]].hiddenColor;
    document.getElementById(game[0].lastMoves[1]).style.backgroundColor =
      mappedColors[game[0].lastMoves[1]].hiddenColor;

    if (game[0].turn !== myNickname) {
      // console.log("TURAUPDATE", game[0].turn);
      // console.log("NICK UPDATE", myNickname);
      isMyTurn = false;
      //block all event listeners
      // squares = squares.map((el) => el.removeEventListener("click", showColor));
      squares.forEach((oldEl) => {
        oldEl.parentNode.replaceChild(oldEl.cloneNode(true), oldEl);
      });
    } else {
      isMyTurn = true;
      squares = document.querySelectorAll(".square");
      squares.forEach((el) =>
        el.addEventListener(
          "click",
          showColor.bind(this, mappedColors[el.id].hiddenColor)
        )
      );
      // console.log("UPD", squares);
    }

    // console.log("UPDEJCIK");
    // console.log(game);

    squares.forEach((sq) => {
      // console.log(`${sq.id} ${game[0].showedSquares.includes(sq.id * 1)}`)
      if (game[0].showedSquares.includes(sq.id * 1) == false)
        if (!document.getElementById(sq.id).classList.contains("square-hidden"))
          document.getElementById(sq.id).classList.toggle("square-hidden");
    });
  });
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

  if (!myNickname) {
    alert("Wpisz poprawny nickname");
    return;
  }

  document.querySelector(".starter-input").classList.toggle("starter-hidden");
  document.querySelector(".submitinput").classList.toggle("starter-hidden");
  document.querySelector(".info").innerHTML = "Czekanie na drugiego gracza";

  // console.log("testQq");
  // console.log(socket);
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

const showColor = (color, event) => {
  if (event.target != lastRevealedSquare) {
    resetSquaresColor();
    revealedAmount++;
    if (revealedAmount == 1) {
      lastRevealedSquare = event.target;
      lastRevealedColor = color;
    } else if (revealedAmount == 2) {
      let isCorrect = false;
      if (color == lastRevealedColor) {
        isCorrect = true;
        event.target.removeEventListener("click", showColor);
        lastRevealedSquare.removeEventListener("click", showColor);
        points++;
        //event socketowy
        document.querySelector(".my-points").innerHTML = points;
      }
      // console.log("PRZEKAZANIE RUCHU Z WYNIKIEM", isCorrect);
      socket.emit("nextMove", {
        myNickname,
        firstFieldId: event.target.id * 1,
        secFieldId: lastRevealedSquare.id * 1,
        isCorrect: isCorrect,
      });
      lastRevealedSquare = -1;
      lastRevealedColor = "";
      revealedAmount = 0;
    }
    event.target.style.backgroundColor = color;
  }
};

const mappedColors = [];

const whoseTurn = () => {
  if (game[0].turn == myNickname) {
    document.querySelector(".tura").textContent = "Twoja tura";
  } else {
    document.querySelector(".tura").textContent = "Tura przeciwnika";
  }
};
