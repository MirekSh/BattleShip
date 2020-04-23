const SHIPS = [
    { name: 'Carrier', size: 5, number: 1},
    { name: 'Battleship', size: 4, number: 1},
    { name: 'Destroyer', size: 3, number: 1},
    { name: 'Submarine', size: 3, number: 2},
    { name: 'Patrol', size: 2, number: 2},
]

const fleet1 = document.querySelector('.fleet-1');
const fleet2 = document.querySelector('.fleet-2');
const fields = document.querySelectorAll('td');

const fleet = SHIPS.reduce((fl, ship) => fl += `<p class="name"><span>${ship.name}</span> x ${ship.number}</p>
        <p class="size">Size: ${ship.size} <img src="./media/${ship.name.toLowerCase()}.png" alt="${ship.name}-img" /> </p>`, ''
)

fleet1.insertAdjacentHTML('afterbegin', fleet);
fleet2.insertAdjacentHTML('afterbegin', fleet);

function addShip() {
    this.classList.toggle('fa');
    this.classList.toggle('fa-check');
}

fields.forEach(field => field.addEventListener('click', addShip));
