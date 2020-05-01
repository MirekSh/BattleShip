// Get data
db.collection('boards').get().then(response => {
    setupBoard(response.docs);
})

// Auth status
auth.onAuthStateChanged(user => {
    if (user) {
        db.collection('boards').add({ user_email: user.email, board: setData() }).then(() => {
            console.log(`Data for ${user} added`);
        })
    }
    else {
        console.log('User logged out')
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