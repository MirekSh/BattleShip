const SHIPS = [
    { name: 'Carrier', size: 5, number: 1},
    { name: 'Battleship', size: 4, number: 1},
    { name: 'Destroyer', size: 3, number: 1},
    { name: 'Submarine', size: 3, number: 2},
    { name: 'Patrol', size: 2, number: 2},
]

const fleet1 = document.querySelector('.fleet-1');
const yourFleet = document.querySelector('.yourFleet')
const cells = document.querySelectorAll('.cell');

console.log("yourFleet", yourFleet)

const fleet = SHIPS.reduce((fl, ship) => fl += `<p class="name"><span>${ship.name}</span> x ${ship.number}</p>
        <p class="size">Size: ${ship.size} <img src="./media/${ship.name.toLowerCase()}.png" alt="${ship.name}-img" /> </p>`, ''
)

fleet1.insertAdjacentHTML('afterbegin', fleet);

function addShip() {
    this.classList.toggle('fa-check');
}

cells.forEach(cell => cell.addEventListener('click', addShip));


function isSlotAvailable(shipLength) {
    const possibilities = [];
    cells.forEach(cell => {
        let { row, column } = cell.dataset;
        row = Number(row);
        column = Number(column);
        if (row + shipLength <= 9) {
            const slot = [];
            for (let i = row; i < row + shipLength; i++) {
                if (!cell.classList.contains('fa-check')) slot.push([i, column]);
            }
            possibilities.push(slot);
        }
        if (column + shipLength <= 9) {
            const slot = [];
            for (let i = column; i < column + shipLength; i++) {
                if (!cell.classList.contains('fa-check')) slot.push([row, i]);
            }
            possibilities.push(slot);
        }
    })
    const randomSlot = possibilities[Math.floor(Math.random() * possibilities.length)];
    randomSlot.forEach(coords => [...cells].find(cell => cell.dataset.row == coords[0] && cell.dataset.column == coords[1]).classList.toggle('fa-check'))
}

isSlotAvailable(5);
isSlotAvailable(4);