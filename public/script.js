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
const oponnent = document.querySelector('.opponent');
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

function updateRounds(user, userRound, userBoard) {
    let document;
    db.collection('rounds').get().then(response => {
        document = response.docs.find(doc => doc.id === docRef);
    }).then(() => {
        const otherUser = Object.keys(document.data()).find(el => el != user);
        db.collection('rounds').doc(document.id).update({
            [user]: {
                round: userRound,
                board: userBoard,
            },
            [otherUser]: {
                round: 5 - userRound,
                board: document.data()[otherUser].board,
            },
        });
    })
}

function setupBoard(data) {
    const fieldArray = [];
    for(ship in data) {
        for(field in data[ship]) {
            const { x, y } = data[ship][field];
            fieldArray.push([x, y]);
        }
    }
    return fieldArray;
}

function checkMarkedCell() {
    const currentUserName = currentUser.email.split('.')[0]
    if(yourRounds > 0) {
        let i;
        const checked = fieldsArray.find((el, index) => {
            i = index;
            return this.dataset.row == el[0] && this.dataset.column == el[1]
        });
        if (checked) {
            this.classList.toggle('fa-check');
            fieldsArray.splice(i, 1);
            console.log(setData(fieldsArray));
            updateRounds(currentUserName, yourRounds, setData(fieldsArray));
            if (fieldsArray.length === 0) alert('There is no more ships');
        } else {
            this.classList.toggle('fa-times-circle-o');
        }
        yourRounds--;
        counter.innerText = `You have ${yourRounds} turns`;
        if(yourRounds === 0) resetCounter().then(() => getCounter(currentUser));
    }
    else {
        playingBoard.style.pointerEvents = 'none';
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
               slot.push([i, column]);
            }
            if (Object.keys(coordsTable).length === 0 || slot.every(el => {
                for (ship in coordsTable) {
                    for (cell in coordsTable[ship]) {
                        return coordsTable[ship][cell].x !== el[0] && coordsTable[ship][cell].y !== el[1];
                    }
                }
            })) possibilities.push(slot);
        }
        if (column + shipLength <= 9) {
            const slot = [];
            for (let i = column; i < column + shipLength; i++) {
                slot.push([row, i]);
             }
             if (Object.keys(coordsTable).length === 0 || slot.every(el => {
                 for (ship in coordsTable) {
                     for (cell in coordsTable[ship]) {
                         return coordsTable[ship][cell].x !== el[0] && coordsTable[ship][cell].y !== el[1];
                     }
                 }
             })) possibilities.push(slot);
        }
    })
    const randomSlot = possibilities[Math.floor(Math.random() * possibilities.length)];
    coordsTable.push(randomSlot);
}

function setData(table) {
    return table.reduce((board, ship, i) => {
        return { ...board, [i]: ship.reduce((object, el, index) => {
            return { ...object, [index]: { x: el[0], y: el[1] } };
        }, {})
    }
    }, {});
}

function getCounter(user) {
    const currentUserName = user.email.split('.')[0];
    const query = db.collection('rounds').limit(1);
    return query.onSnapshot(snapshot => {
        if(snapshot) {
            snapshot.docChanges().forEach(change => {
                const otherUser = Object.keys(change.doc.data()).filter(name => name != currentUserName);
                const { round } = change.doc.data()[currentUserName];
                const { board } = change.doc.data()[otherUser];
                fieldsArray = setupBoard(board);
                yourRounds = round;
                docRef = change.doc.id;
                counter.innerText = `You have ${round} turns`;
                playingBoard.style.pointerEvents = 'auto';
              });
        }

    })
}

function resetCounter() {
    let document;
    const currentUserName = currentUser.email.split('.')[0]
    const otherUserName = otherPlayer.user_email.split('.')[0]
    return db.collection('rounds').get().then(response => {
        document = response.docs.find(doc => doc.id === docRef);
        console.log("resetCounter -> document", document.data())
    }).then(() => {
        db.collection('rounds').doc(document.id).update({
            [currentUserName]: {
                round: 0,
                board: document.data()[currentUserName].board,
            },
            [otherUserName]: {
                round: 5,
                board: document.data()[otherUserName].board,
            },
        });
    })
}

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
        const userName = user.email.split('.')[0];
        const rounds = response.docs.filter(doc => doc.data()[userName]);
        if (rounds.length > 0) {
            return Promise.all(rounds.map(round =>
                remmoveDataFromFirestore(round.id, 'rounds')
            ))
        } else return;
    }))
}

function updateBoard(user) {
        fillAvailableSlot(5);
        fillAvailableSlot(4);
        fillAvailableSlot(3);
        fillAvailableSlot(2);
        fillAvailableSlot(2);
        const board = setData(coordsTable);
        return db.collection('boards').add({ user_email: user.email, board }).then(response => {
            game.id = response.id;
            console.log(`Data for ${user.email} added`);
        }).then(() =>
            db.collection('boards').get().then(response => {
                otherPlayer = response.docs.map(el => el.data()).filter(el => el.user_email != user.email)[0];
            })).then(() => {
            const random = Math.round(Math.random());
            const currentUserName = user.email.split('.')[0]
            const otherUserName = otherPlayer.user_email.split('.')[0]
            oponnent.innerText = `Oponent: ${otherPlayer.user_email}`;
            return db.collection('rounds').add({
                [currentUserName]: {
                    round: random * 5,
                    board,
                },
                [otherUserName]: {
                    round: (1 - random) * 5,
                    board: otherPlayer.board,
                }
            }).then(response => {
                docRef = response.id;
                console.log('Board', board);
                for (ship in board) {
                    for (cell in board[ship]) {
                        const { x, y } = board[ship][cell];
                        [...cells].find(cell => cell.dataset.row == x && cell.dataset.column == y).classList.toggle('fa-check');
                    }
                }
            })
        })
}

auth.onAuthStateChanged(user => {
    if (user) {
        clearData(user).then(() => updateBoard(user)).then(() => getCounter(user)).then(() => {
            currentUser = user;
            currUser.innerText = `Logged user ${currentUser.email}`;
        });
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
