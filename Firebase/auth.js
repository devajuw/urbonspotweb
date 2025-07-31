import { auth } from './config.js';
import { signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';

export function setupAuth() {
    const logoutBtn = document.getElementById('logoutBtn');
    const profileDiv = document.getElementById('profile');
    const loginContainer = document.getElementById('loginContainer');

    if (!logoutBtn) {
        console.error('Logout button not found in the DOM.');
        return;
    }

    // Handle logout
    logoutBtn.addEventListener('click', async () => {
        try {
            console.log('Logout button clicked');
            await signOut(auth);
            localStorage.removeItem('user'); // Clear user data from localStorage
            console.log('User signed out successfully');
            
            // Update UI after logout
            profileDiv.classList.add('hidden'); // Hide profile section
            loginContainer.classList.remove('hidden'); // Show login button
            window.location.href = '/HTML/login.html'; // Redirect to login page
        } catch (error) {
            console.error('Logout error:', error.message);
            alert('Error logging out: ' + error.message);
        }
    });

    // Monitor auth state
    onAuthStateChanged(auth, (user) => {
        const currentPage = window.location.pathname.split('/').pop() || '/HTML/home.html';
        console.log('Auth state changed, user:', user ? user.uid : 'null', 'on page:', currentPage);

        if (user) {
            // User is signed in
            profileDiv.classList.remove('hidden');
            loginContainer.classList.add('hidden');
        } else {
            // No user is signed in
            profileDiv.classList.add('hidden');
            loginContainer.classList.remove('hidden');
            if (currentPage === '/HTML/home.html') {
                window.location.href = '/HTML/login.html';
            }
        }
    });
}