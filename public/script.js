const SHIPS = [
    { name: 'Carrier', size: 5, number: 1},
    { name: 'Battleship', size: 4, number: 1},
    { name: 'Destroyer', size: 3, number: 1},
    { name: 'Submarine', size: 3, number: 2},
    { name: 'Patrol', size: 2, number: 2},
]

const fleet1 = document.querySelector('.fleet-1');
const yourFleet = document.querySelector('.yourFleet')
const cells = document.querySelectorAll('.yourFleet .cell');
const boardCells = document.querySelectorAll('.playingBoard .cell');
const playingBoard = document.querySelector('.playingBoard');
const signUp = document.querySelector('.signUp');
const logIn = document.querySelector('.logIn');
const closeBtn = document.querySelectorAll('.close');
const singUpBtn = document.querySelector('.signUpBtn');
const logoutBtn = document.querySelector('.logout');
const loginBtn = document.querySelector('.loginBtn');
const counter = document.querySelector('.counter');
const currUser = document.querySelector('.user');
const coordsTable = [];
let opponentBoard;
let fieldsArray = [];
let game = {};
let otherPlayer;
let yourRounds = 0;
let currentUser;
let currentEmail;
let docRef;


const fleet = SHIPS.reduce((fl, ship) => fl += `<p class="name"><span>${ship.name}</span> x ${ship.number}</p>
        <p class="size">Size: ${ship.size} <img src="./media/${ship.name.toLowerCase()}.png" alt="${ship.name}-img" /> </p>`, ''
)

function addShip() {
    this.classList.toggle('fa-check');
}

function setupBoard(data, email) {
    const opponentBoard = data.map(el => el.data()).filter(el => el.user_email != email).reverse()[0];

    for(ship in opponentBoard.board) {
        for(field in opponentBoard.board[ship]) {
            const { x, y } = opponentBoard.board[ship][field];
            fieldsArray.push([x, y]);
        }
    }
}

function checkMarkedCell() {
    if(yourRounds > 0) {
        let i;
        const checked = fieldsArray.find((el, index) => {
            i = index;
            return this.dataset.row == el[0] && this.dataset.column == el[1]
        });
        if (checked) {
            this.classList.toggle('fa-check');
            fieldsArray.splice(i, 1);
            if (fieldsArray.length === 0) alert('There is no more ships');
        } else {
            this.classList.toggle('fa-times-circle-o');
        }
        yourRounds--;
        counter.innerText = `You have ${yourRounds} turns`;
    }
    else {
        playingBoard.style.pointerEvents = 'none';
        console.log("checkMarkedCell -> playingBoard", playingBoard)
    }
}

function fillAvailableSlot(shipLength) {
    const possibilities = [];
    cells.forEach(cell => {
        let { row, column } = cell.dataset;
        row = Number(row);
        column = Number(column);
        if (row + shipLength <= 9) {
            const slot = [];
            for (let i = row; i < row + shipLength; i++) {
               const currentCell = [...cells].find(cell => cell.dataset.row == i && cell.dataset.column == column);
               if (!currentCell.classList.contains('fa-check')) slot.push([i, column]);
            }
            possibilities.push(slot);
        }
        if (column + shipLength <= 9) {
            const slot = [];
            for (let i = column; i < column + shipLength; i++) {
                const currentCell = [...cells].find(cell => cell.dataset.row == row && cell.dataset.column == i);
                if (!currentCell.classList.contains('fa-check')) {
                    slot.push([row, i]);
                }
            }
            possibilities.push(slot);
        }
    })
    const randomSlot = possibilities[Math.floor(Math.random() * possibilities.length)];
    coordsTable.push(randomSlot);
    randomSlot.forEach(coords => {
        [...cells].find(cell => cell.dataset.row == coords[0] && cell.dataset.column == coords[1]).classList.toggle('fa-check');
    });
}

function setData() {
    return coordsTable.reduce((board, ship, i) => {
        return { ...board, [i]: ship.reduce((object, el, index) => {
            return { ...object, [index]: { x: el[0], y: el[1] } };
        }, {})
    }
    }, {});
}

function getCounter(user) {
    const query = db.collection('rounds').orderBy('timestamp', 'desc').limit(1);
    query.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          console.log('Change', change);
        });
    })
    return db.collection('rounds').get().then(response => {
        const round = response.docs.find(doc => doc.data()[user.email]).data()[user.email].round;
        console.log("getCounter -> round", round)
        yourRounds = round;
        counter.innerText = `You have ${round} turns`;
    })
}

function resetCounter() {
    let player1;
    let player2;
    db.collection('rounds').get().then(response => {
        const data = response.docs.map(el => el.data())
        // player = response.docs.map(el => el.data()).filter(el => el.user_email != currentUser.email)[0];
        console.log("resetCounter -> otherPlayer", data)
    })
    // return db.collection('rounds').doc(docRef).update({
    //     player1: {
    //         mail: user.email,
    //         round: currentUser.email == ,
    //     },
    //     player2: {
    //         mail: otherPlayer.user_email,
    //         round: (1 - random) * 5,
    //     }
    // })
}

// function loadMessages() {
//     // Create the query to load the last 12 messages and listen for new ones.
//     var query = firebase.firestore()
//                     .collection('messages')
//                     .orderBy('timestamp', 'desc')
//                     .limit(12);

//     // Start listening to the query.
//     query.onSnapshot(function(snapshot) {
//       snapshot.docChanges().forEach(function(change) {
//         if (change.type === 'removed') {
//           deleteMessage(change.doc.id);
//         } else {
//           var message = change.doc.data();
//           displayMessage(change.doc.id, message.timestamp, message.name,
//                          message.text, message.profilePicUrl, message.imageUrl);
//         }
//       });
//     });
//   }

function remmoveDataFromFirestore(id, collection) {
    db.collection(collection).doc(id).delete()
}

function clearData(user) {
    return db.collection('boards').get().then(response => {
        const boards = response.docs.filter(doc => doc.data().user_email === user.email);
        return Promise.all(boards.map(doc =>
            remmoveDataFromFirestore(doc.id, 'boards')
        ));
    }).then(() => db.collection('rounds').get().then(response => {
        const rounds = response.docs.filter(doc => doc.data()[user.email]);
        return Promise.all(rounds.map(round =>
            remmoveDataFromFirestore(round.id, 'rounds')
        ))
    }))
}

function updateBoard(user) {
        fillAvailableSlot(5);
        fillAvailableSlot(4);
        fillAvailableSlot(3);
        fillAvailableSlot(2);
        fillAvailableSlot(2);

        return db.collection('boards').add({ user_email: user.email, board: setData() }).then(response => {
            game.id = response.id;
            console.log(`Data for ${user.email} added`);
        }).then(() =>
            db.collection('boards').get().then(response => {
                otherPlayer = response.docs.map(el => el.data()).filter(el => el.user_email != user.email)[0];
                setupBoard(response.docs, user.email);
            })).then(() => {
            const random = Math.round(Math.random());
            return db.collection('rounds').add({
                [user.email]: {
                    round: random * 5,
                },
                [otherPlayer.user_email]: {
                    round: (1 - random) * 5,
                }
            }).then(response => {
                docRef = response.id;
            })
        })
}

auth.onAuthStateChanged(user => {
    if (user) {
        clearData(user).then(() => updateBoard(user)).then(() => getCounter(user)).then(() => {
            currentUser = user;
            currUser.innerText = `Logged user ${currentUser.email}`;
        }).then(() => resetCounter());
    }
    else {
        db.collection('boards').doc(game.id).delete().then(function() {
            console.log(`Document ${game.id} successfully deleted!`);
        })
    }
})

singUpBtn.addEventListener('click', e => {
    e.preventDefault();

    const suemail = document.querySelector('.suEmail').value;
    const supasswd = document.querySelector('.suPassword').value;

    auth.createUserWithEmailAndPassword(suemail, supasswd).then(cred => {
        console.log(cred);
    })
    document.querySelector('.signPopup').style.display = 'none';
})

logoutBtn.addEventListener('click', e => {
    e.preventDefault();

    auth.signOut().then(() => {
        console.log('User logged out');
    });
})

loginBtn.addEventListener('click', e => {
    e.preventDefault();

    const liEmail = document.querySelector('.liEmail').value;
    const liPasswd = document.querySelector('.liPassword').value;

    auth.signInWithEmailAndPassword(liEmail, liPasswd).then(cred => {
        console.log(cred);
    })
    document.querySelector('.logInPopup').style.display = 'none';
});


closeBtn.forEach(btn => btn.addEventListener('click', () => {
    document.querySelector('.signPopup').style.display = 'none';
    document.querySelector('.logInPopup').style.display = 'none';
}))

signUp.addEventListener('click', () => {
    document.querySelector('.signPopup').style.display = 'flex';
})

logIn.addEventListener('click', () => {
    document.querySelector('.logInPopup').style.display = 'flex';
})

fleet1.insertAdjacentHTML('afterbegin', fleet);

boardCells.forEach(boardCell => boardCell.addEventListener('click', checkMarkedCell));
