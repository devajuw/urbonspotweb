import { auth, googleProvider } from './config.js';
import { createUserWithEmailAndPassword, signInWithPopup } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js';

export function setupRegister() {
    const registerForm = document.getElementById('register');
    const googleRegisterBtn = document.getElementById('google-register');

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    console.log('Registered:', userCredential.user);
                    window.location.href = 'home.html';
                })
                .catch((error) => {
                    console.error('Registration error:', error.message);
                    alert(error.message);
                });
        });
    }

    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', () => {
            signInWithPopup(auth, googleProvider)
                .then((result) => {
                    const user = result.user;
                    localStorage.setItem('user', JSON.stringify({
                        displayName: user.displayName,
                        email: user.email,
                        photoURL: user.photoURL
                    })); // Store user data in localStorage
                    console.log('Google register:', user);
                    window.location.href = 'home.html';
                })
                .catch((error) => {
                    console.error('Google register error:', error.message);
                    alert(error.message);
                });
        });
    }
}