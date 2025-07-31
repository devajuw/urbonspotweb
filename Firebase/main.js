import { setupAuth } from './auth.js';
import { signIn, register, signInWithGoogle } from './service.js';

document.addEventListener('DOMContentLoaded', () => {
    setupAuth();
});

// Handle login form
const loginForm = document.getElementById('login');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            await signIn(email, password);
            alert('Login successful!');
            window.location.href = '/HTML/home.html';
        } catch (error) {
            alert('Login failed: ' + error.message);
            console.error('Login error:', error.message);
        }
    });
}

// Handle register form
const registerForm = document.getElementById('register');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        console.log('Form submitted with:', { name, email, password });

        try {
            const user = await register(name, email, password);
            console.log('Registration successful for UID:', user.uid);
            window.location.href = '/HTML/home.html';
        } catch (error) {
            alert('Registration failed: ' + error.message);
            console.error('Registration error:', error.message);
        }
    });
}

// Handle Google login/signup
const googleLoginBtn = document.getElementById('google-login');
const googleSignupBtn = document.getElementById('google-signup');

if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        try {
            const user = await signInWithGoogle();
            localStorage.setItem('user', JSON.stringify({
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL
            })); // Store user data in localStorage
            console.log('Google login successful for UID:', user.uid);
            window.location.href = '/HTML/home.html';
        } catch (error) {
            alert('Google login failed: ' + error.message);
            console.error('Google login error:', error.message);
        }
    });
}

if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', async () => {
        try {
            const user = await signInWithGoogle();
            console.log('Google signup successful for UID:', user.uid);
            window.location.href = '/HTML/home.html';
        } catch (error) {
            alert('Google signup failed: ' + error.message);
            console.error('Google signup error:', error.message);
        }
    });
}