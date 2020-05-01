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
const signUp = document.querySelector('.signUp');
const logIn = document.querySelector('.logIn');
const close = document.querySelectorAll('.close');
const coordsTable = [];

close.forEach(btn => btn.addEventListener('click', () => {
    document.querySelector('.signPopup').style.display = 'none';
    document.querySelector('.logInPopup').style.display = 'none';
}))

signUp.addEventListener('click', () => {
    document.querySelector('.signPopup').style.display = 'flex';
})

logIn.addEventListener('click', () => {
    document.querySelector('.logInPopup').style.display = 'flex';
})

const fleet = SHIPS.reduce((fl, ship) => fl += `<p class="name"><span>${ship.name}</span> x ${ship.number}</p>
        <p class="size">Size: ${ship.size} <img src="./media/${ship.name.toLowerCase()}.png" alt="${ship.name}-img" /> </p>`, ''
)

fleet1.insertAdjacentHTML('afterbegin', fleet);

function addShip() {
    this.classList.toggle('fa-check');
}

function checkShip() {
    if (this.classList.contains('ship')) this.classList.add('fa-times');
}

boardCells.forEach(boardCell => boardCell.addEventListener('click', checkShip));

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
        [...boardCells].find(cell => cell.dataset.row == coords[0] && cell.dataset.column == coords[1]).classList.toggle('ship');
    });
}

fillAvailableSlot(5);
fillAvailableSlot(4);
fillAvailableSlot(3);
fillAvailableSlot(2);
fillAvailableSlot(2);

function setData() {
    return coordsTable.reduce((board, ship, i) => {
        return { ...board, [i]: ship.reduce((object, el, index) => {
            return { ...object, [index]: { x: el[0], y: el[1] } };
        }, {})
    }
    }, {});
}

function setupBoard(data) {
    data.forEach(el => console.log(el.data()))
}
