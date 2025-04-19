import { auth } from './config.js';
import { signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';

export function setupAuth() {
    const logoutBtn = document.getElementById('logout');
    const userEmailSpan = document.getElementById('user-email');

    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Logout error:', error.message);
                alert('Error logging out: ' + error.message);
            }
        });
    }

    // Monitor auth state with a delay to avoid race conditions
    onAuthStateChanged(auth, (user) => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        console.log('Auth state changed, user:', user ? user.uid : 'null', 'on page:', currentPage);

        // Delay redirection to allow registration to complete
        setTimeout(() => {
            if (user) {
                // User is signed in
                if (userEmailSpan) {
                    userEmailSpan.textContent = user.email || user.displayName || 'User';
                }
                // Only redirect if not on register page during registration
                if (currentPage === 'login.html' && currentPage !== 'register.html') {
                    window.location.href = 'index.html';
                }
            } else {
                // No user is signed in
                if (currentPage === 'index.html') {
                    window.location.href = 'login.html';
                }
            }
        }, 1000); // 5-second delay to allow registration to finish
    });
}