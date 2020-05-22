const SHIPS = [
  { name: "Carrier", size: 5, number: 1 },
  { name: "Battleship", size: 4, number: 1 },
  { name: "Destroyer", size: 3, number: 1 },
  { name: "Submarine", size: 3, number: 2 },
  { name: "Patrol", size: 2, number: 2 },
];

const fleet1 = document.querySelector(".fleet-1");
const yourFleet = document.querySelector(".yourFleet");
const cells = document.querySelectorAll(".yourFleet .cell");
const boardCells = document.querySelectorAll(".playingBoard .cell");
const playingBoard = document.querySelector(".playingBoard");
const signUp = document.querySelector(".signUp");
const logIn = document.querySelector(".logIn");
const closeBtn = document.querySelectorAll(".close");
const singUpBtn = document.querySelector(".signUpBtn");
const logoutBtn = document.querySelector(".logout");
const loginBtn = document.querySelector(".loginBtn");
const counter = document.querySelector(".counter");
const currUser = document.querySelector(".user");
const oponnent = document.querySelector(".opponent");
const coordsTable = [];
let opponentBoard;
let fieldsArray = [];
let game = {};
let otherPlayer;
let yourRounds = 0;
let currentUser;
let docRef;

const fleet = SHIPS.reduce(
  (fl, ship) =>
    (fl += `<p class="name"><span>${ship.name}</span> x ${ship.number}</p>
        <p class="size">Size: ${
          ship.size
        } <img src="./media/${ship.name.toLowerCase()}.png" alt="${
      ship.name
    }-img" /> </p>`),
  ""
);

// function updateRounds(user, userRound, userBoard) {
//   let document;
//   db.collection("rounds")
//     .get()
//     .then((response) => {
//       document = response.docs.find((doc) => doc.id === docRef);
//     })
//     .then(() => {
//       const otherUser = Object.keys(document.data()).find((el) => el != user);
//       db.collection("rounds")
//         .doc(document.id)
//         .update({
//           [user]: {
//             round: userRound,
//             board: userBoard,
//           },
//           [otherUser]: {
//             round: 5 - userRound,
//             board: document.data()[otherUser].board,
//           },
//         });
//     });
// }

function setupBoard(data) {
  const fieldArray = [];
  for (field in data) {
    const { x, y } = data[field];
    fieldArray.push([x, y]);
  }
  return fieldArray;
}

function checkMarkedCell() {
  if (yourRounds > 0) {
    let i;
    const checked = fieldsArray.find((el, index) => {
      i = index;
      return this.dataset.row == el[0] && this.dataset.column == el[1];
    });
    if (checked) {
      this.classList.toggle("fa-check");
      fieldsArray.splice(i, 1);
      console.log(setData(fieldsArray));
      if (fieldsArray.length === 0) alert("There is no more ships");
    } else {
      this.classList.toggle("fa-times-circle-o");
    }
    yourRounds--;
    counter.innerText = `You have ${yourRounds} turns`;
    if (yourRounds === 0) resetCounter().then(() => getCounter(currentUser));
  } else {
    playingBoard.style.pointerEvents = "none";
  }
}

function fillAvailableSlot(shipLength) {
  const possibilities = [];
  cells.forEach((cell) => {
    let { row, column } = cell.dataset;
    row = Number(row);
    column = Number(column);
    if (row + shipLength <= 9) {
      const slot = [];
      for (let i = row; i < row + shipLength; i++) {
        slot.push([i, column]);
      }
      if (
        Object.keys(coordsTable).length === 0 ||
        slot.every((el) => {
          for (ship in coordsTable) {
            for (cell in coordsTable[ship]) {
              return (
                coordsTable[ship][cell].x !== el[0] &&
                coordsTable[ship][cell].y !== el[1]
              );
            }
          }
        })
      )
        possibilities.push(slot);
    }
    if (column + shipLength <= 9) {
      const slot = [];
      for (let i = column; i < column + shipLength; i++) {
        slot.push([row, i]);
      }
      if (
        Object.keys(coordsTable).length === 0 ||
        slot.every((el) => {
          for (ship in coordsTable) {
            for (cell in coordsTable[ship]) {
              return (
                coordsTable[ship][cell].x !== el[0] &&
                coordsTable[ship][cell].y !== el[1]
              );
            }
          }
        })
      )
        possibilities.push(slot);
    }
  });
  const randomSlot =
    possibilities[Math.floor(Math.random() * possibilities.length)];
  randomSlot.forEach((el) => coordsTable.push(el));
}

function setData(table) {
  return table.reduce((board, cell, index) => {
    return { ...board, [index]: { x: cell[0], y: cell[1] } };
  }, {});
}

function fillFleet(cells, board) {
  const boardArray = Object.values(board);
  console.log("fillFleet -> boardArray", boardArray)
  boardArray.forEach(coords => [...cells].find(cell => cell.dataset.row == coords.x && cell.dataset.column == coords.y).classList.add('fa-check'));
}

function setGame(user) {
  const queryBoard = db.collection("boards");
  return queryBoard.onSnapshot((snapshot) => {
    if (snapshot) {
      const changes = snapshot.docChanges();
      if (changes.length >= 2) {
        const userBoard = changes.find(
          (change) => change.doc.data().user_email === user.email
        );
        console.log("setGame -> userBoard", userBoard);
        const otherUserBoard = changes.find(
          (change) => change.doc.data().user_email !== user.email
        );
        console.log("setGame -> otherUserBoard", otherUserBoard);

        const userBoardData = userBoard.doc.data();
        const otherUserBoardData = otherUserBoard.doc.data();
        const random = Math.round(Math.random());
        const currentUserName = userBoardData.user_email.split(".")[0];
        const otherUserName = otherUserBoardData.user_email.split(".")[0];
        return db
          .collection("rounds")
          .add({
            [currentUserName]: {
              round: random * 5,
              board: userBoardData.board,
            },
            [otherUserName]: {
              round: (1 - random) * 5,
              board: otherUserBoardData.board,
            },
          })
          .then(response => {
            game.id = response.id;
          })
          .then(() => {
            [userBoard.doc.id, otherUserBoard.doc.id].forEach((id) =>
              remmoveDataFromFirestore(id, "boards")
            );
          });
      }
    }
  });
}

function getCounter(user) {
  const currentUserName = user.email.split(".")[0];
  const query = db.collection("rounds");
  return query.onSnapshot((snapshot) => {
    if (
      snapshot.docChanges().length > 0 &&
      snapshot.docChanges().some((change) => change.doc.data()[currentUserName])
    ) {
      const filtered = snapshot
        .docChanges()
        .find((change) => change.doc.data()[currentUserName]);
      const filteredChange = filtered.doc.data();
      otherPlayer = Object.keys(filteredChange).find(
        (name) => name != currentUserName
      );
      const { round } = filteredChange[currentUserName];
      const { board } = filteredChange[otherPlayer];

      fillFleet(cells, filteredChange[currentUserName].board);
      fieldsArray = setupBoard(board);
      yourRounds = round;
      docRef = filtered.doc.id;
      counter.innerText = `You have ${round} turns`;
      oponnent.innerText = `Oponent: ${otherPlayer}`;
      playingBoard.style.pointerEvents = "auto";
    }
  });
}

function resetCounter() {
  let document;
  const currentUserName = currentUser.email.split(".")[0];
  return db
    .collection("rounds")
    .get()
    .then((response) => {
      document = response.docs.find((doc) => doc.id === docRef);
    })
    .then(() => {
      db.collection("rounds")
        .doc(document.id)
        .update({
          [currentUserName]: {
            round: 0,
            board: document.data()[currentUserName].board,
          },
          [otherPlayer]: {
            round: 5,
            board: document.data()[otherPlayer].board,
          },
        });
    });
}

function remmoveDataFromFirestore(id, collection) {
  db.collection(collection).doc(id).delete();
}

function clearData(user) {
  return db
    .collection("boards")
    .get()
    .then((response) => {
      const boards = response.docs.filter(
        (doc) => doc.data().user_email === user.email
      );
      return Promise.all(
        boards.map((doc) => remmoveDataFromFirestore(doc.id, "boards"))
      );
    })
    .then(() =>
      db
        .collection("rounds")
        .get()
        .then((response) => {
          const userName = user.email.split(".")[0];
          const rounds = response.docs.filter((doc) => doc.data()[userName]);
          if (rounds.length > 0) {
            return Promise.all(
              rounds.map((round) =>
                remmoveDataFromFirestore(round.id, "rounds")
              )
            );
          } else return;
        })
    );
}

function createBoard(user) {
  SHIPS.forEach((ship) => {
    for (let i = 0; i < ship.number; i++) {
      fillAvailableSlot(ship.size);
    }
  });

  const board = setData(coordsTable);
  return db
    .collection("boards")
    .add({ user_email: user.email, board })
    .then(() => {
      console.log(`Data for ${user.email} added`);
    });
}

auth.onAuthStateChanged((user) => {
  if (user) {
    clearData(user)
      .then(() => createBoard(user))
      .then(() => setGame(user))
      .then(() => getCounter(user))
      .then(() => {
        currentUser = user;
        currUser.innerText = `Logged user ${currentUser.email}`;
      });
  } else {
    db.collection("rounds")
      .doc(game.id)
      .delete()
      .then(function () {
        console.log(`Document ${game.id} successfully deleted!`);
      });
  }
});

singUpBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const suemail = document.querySelector(".suEmail").value;
  const supasswd = document.querySelector(".suPassword").value;

  auth.createUserWithEmailAndPassword(suemail, supasswd).then((cred) => {
    console.log(cred);
  });
  document.querySelector(".signPopup").style.display = "none";
});

logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();

  auth.signOut().then(() => {
    console.log("User logged out");
  });
});

loginBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const liEmail = document.querySelector(".liEmail").value;
  const liPasswd = document.querySelector(".liPassword").value;

  auth.signInWithEmailAndPassword(liEmail, liPasswd).then((cred) => {
    console.log(cred);
  });
  document.querySelector(".logInPopup").style.display = "none";
});

closeBtn.forEach((btn) =>
  btn.addEventListener("click", () => {
    document.querySelector(".signPopup").style.display = "none";
    document.querySelector(".logInPopup").style.display = "none";
  })
);

signUp.addEventListener("click", () => {
  document.querySelector(".signPopup").style.display = "flex";
});

logIn.addEventListener("click", () => {
  document.querySelector(".logInPopup").style.display = "flex";
});

fleet1.insertAdjacentHTML("afterbegin", fleet);

boardCells.forEach((boardCell) =>
  boardCell.addEventListener("click", checkMarkedCell)
);
