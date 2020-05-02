let game = {};

function remmoveDataFromFirestore(id) {
    db.collection('boards').doc(id).delete()
}

function updateBoard(user) {
    db.collection('boards').get().then(response => {
        const boards = response.docs.filter(doc => doc.data().user_email === user.email);
        Promise.all(boards.map(doc => remmoveDataFromFirestore(doc.id)));
    }).then(() => {
        fillAvailableSlot(5);
        fillAvailableSlot(4);
        fillAvailableSlot(3);
        fillAvailableSlot(2);
        fillAvailableSlot(2);

        db.collection('boards').add({ user_email: user.email, board: setData() }).then(response => {
            game.id = response.id;
            console.log(`Data for ${user.email} added`);
        }).then(() => {
            db.collection('boards').get().then(response => {
                setupBoard(response.docs, user.email);
            });
        })
    })
}

auth.onAuthStateChanged(user => {
    if (user) {
        updateBoard(user);
    }
    else {
        db.collection('boards').doc(game.id).delete().then(function() {
            console.log(`Document ${game.id} successfully deleted!`);
        })
    }
})


const singUpBtn = document.querySelector('.signUpBtn');
const logoutBtn = document.querySelector('.logout');
const loginBtn = document.querySelector('.loginBtn')

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