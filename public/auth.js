// Get data
db.collection('boards').get().then(response => {
    console.log("response", response.docs);   
})

// Set data
    db.collection('boards').doc('Test').set({ user: 'name', fields: 'Test' });

// Auth status
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('User logged in');
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