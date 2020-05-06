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
const coordsTable = [];
let opponentBoard;
let fieldsArray = [];
let game = {};
let otherPlayer;
let yourRounds = 0;


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
    console.log("checkMarkedCell -> yourRounds", yourRounds)
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
    return db.collection('rounds').get().then(response => {
        const round = response.docs.filter(round => round.data().player1.mail == user.email || round.data().player2.mail == user.email).map(round => round.data())[0];
        console.log("getCounter -> round", round)
        const playerRound = round.player1.mail == user.email ? round.player1.round : round.player2.round;
        yourRounds = playerRound;
        counter.innerText = `You have ${playerRound} turns`;
    })
}

function resetCounter(user) {
    return db.collection('rounds').add({
        player1: {
            mail: user.email,
            round: random * 5,
        },
        player2: {
            mail: otherPlayer.user_email,
            round: (1 - random) * 5,
        }
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
        const rounds = response.docs.filter(round => round.data().player1.mail == user.email || round.data().player2.mail);
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
                player1: {
                    mail: user.email,
                    round: random * 5,
                },
                player2: {
                    mail: otherPlayer.user_email,
                    round: (1 - random) * 5,
                }
            })
        })
}

auth.onAuthStateChanged(user => {
    if (user) {
        clearData(user).then(() => updateBoard(user)).then(() => getCounter(user));
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
