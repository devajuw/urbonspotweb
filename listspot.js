// listspot.js - Handles parking space listing form submission to Firebase
console.log('SCRIPT START: listspot.js loaded - beginning execution');

// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js';

console.log('Firebase imports successful');

// Global Firebase variables
let app, auth, db, storage;
let currentUser = null;
let parkingForm;
let photoInput;
let isLoading = false; // Track loading state

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB5rM-Z_YxL6mpPb5qX3S7A-ykBshAA_Ro",
    authDomain: "dev-85f8d.firebaseapp.com",
    projectId: "dev-85f8d",
    storageBucket: "dev-85f8d.appspot.com",
    messagingSenderId: "884673937857",
    appId: "1:884673937857:web:97943fdefae91ccfe36f40",
    measurementId: "G-4CR2VG9QTK"
};

// Function to update debug panel
function updateDebugStatus(id, message, isError = false) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = message;
        element.style.color = isError ? 'red' : 'green';
    }
}

// Function to show/hide loading overlay
function showLoading(show = true, message = 'Processing...') {
    isLoading = show; // Update loading state tracker
    const loadingOverlay = document.getElementById('loading-overlay');
    if (!loadingOverlay) return;
    if (show) {
        const messageElement = loadingOverlay.querySelector('p');
        if (messageElement) messageElement.textContent = message;
        loadingOverlay.style.display = 'flex';
    } else {
        loadingOverlay.style.display = 'none';
    }
}

// Function to update loading message without changing display state
function updateLoadingMessage(message) {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        const messageElement = loadingOverlay.querySelector('p');
        if (messageElement) messageElement.textContent = message;
    }
}

// Show/hide popup function
function showPopup(title, message, type = 'default', callback = null) {
    const popupOverlay = document.getElementById('custom-popup');
    if (!popupOverlay) {
        alert(`${title}: ${message}`);
        return;
    }
    const popup = popupOverlay.querySelector('.popup');
    const popupTitle = popupOverlay.querySelector('.popup-title');
    const popupMessage = popupOverlay.querySelector('.popup-message');
    const popupButton = popupOverlay.querySelector('.popup-button');
    popup.classList.remove('success', 'error');
    if (type === 'success' || type === 'error') popup.classList.add(type);
    popupTitle.textContent = title;
    popupMessage.textContent = message;
    popupOverlay.classList.add('show');
    const closePopup = () => {
        popupOverlay.classList.remove('show');
        if (typeof callback === 'function') setTimeout(callback, 300);
    };
    popupButton.onclick = closePopup;
    popupOverlay.querySelector('.popup-close').onclick = closePopup;
    popupOverlay.onclick = (event) => {
        if (event.target === popupOverlay) closePopup();
    };
}
function hidePopup() {
    const popupOverlay = document.getElementById('custom-popup');
    if (popupOverlay) popupOverlay.classList.remove('show');
}

// Initialize Firebase
async function initializeFirebase() {
    updateDebugStatus('firebase-status', 'Initializing Firebase...');
    showLoading(true, 'Initializing Firebase...');
    try {
        app = initializeApp(firebaseConfig);
        updateDebugStatus('firebase-status', 'Firebase App initialized');
        auth = getAuth(app);
        updateDebugStatus('auth-status', 'Auth initialized');
        db = getFirestore(app);
        updateDebugStatus('firestore-status', 'Firestore initialized');
        storage = getStorage(app);
        updateDebugStatus('storage-status', 'Storage initialized');
        setupForm();
        showLoading(false);
        const retryButton = document.getElementById('debug-retry');
        if (retryButton) retryButton.addEventListener('click', initializeFirebase);
        return true;
    } catch (error) {
        updateDebugStatus('firebase-status', 'Firebase initialization failed: ' + error.message, true);
        showLoading(false);
        showPopup('Firebase Error', 'Failed to initialize Firebase: ' + error.message, 'error');
        const retryButton = document.getElementById('debug-retry');
        if (retryButton) retryButton.addEventListener('click', initializeFirebase);
        return false;
    }
}

// Setup form and authentication
function setupForm() {
    parkingForm = document.getElementById('parkingForm');
    photoInput = document.getElementById('photo');
    if (!parkingForm) {
        updateDebugStatus('form-status', 'Form not found!', true);
        showPopup('Error', 'Form not found. Please refresh the page.', 'error');
        return;
    }
    if (!parkingForm._hasSubmitListener) {
        parkingForm.addEventListener('submit', handleSubmit);
        parkingForm._hasSubmitListener = true;
    }
    if (auth) {
        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            updateDebugStatus('auth-status', user ? `Signed in as ${user.email || user.uid}` : 'Not signed in');
            const submitButton = parkingForm.querySelector('button[type="submit"]');
            if (submitButton) submitButton.disabled = !user;
            if (!user) {
                const formContainer = document.querySelector('.form-container');
                if (formContainer) {
                    let authMessage = document.getElementById('auth-message');
                    if (!authMessage) {
                        authMessage = document.createElement('div');
                        authMessage.id = 'auth-message';
                        authMessage.style.color = 'red';
                        authMessage.style.marginBottom = '20px';
                        authMessage.style.textAlign = 'center';
                        authMessage.innerHTML = 'You must be <a href="login.html">logged in</a> to list a parking spot.';
                        formContainer.insertBefore(authMessage, parkingForm);
                    }
                }
            } else {
                const authMessage = document.getElementById('auth-message');
                if (authMessage) authMessage.remove();
            }
        });
    }
    updateDebugStatus('form-status', 'Form ready');
}

// Geocode address to get coordinates
async function geocodeAddress(address) {
    if (!window.google || !window.google.maps) throw new Error('Google Maps API not loaded');
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error('Geocoding timed out. Please try again or use a more specific address.')), 15000);
        const geocoder = new google.maps.Geocoder();
        if (!address || typeof address !== 'string' || address.trim() === '') {
            clearTimeout(timeoutId);
            reject(new Error('Invalid address format'));
            return;
        }
        geocoder.geocode({ address }, (results, status) => {
            clearTimeout(timeoutId);
            if (status === 'OK' && results && results[0]) {
                const location = results[0].geometry.location;
                resolve({
                    latitude: location.lat(),
                    longitude: location.lng(),
                    formattedAddress: results[0].formatted_address
                });
            } else {
                let errorMessage;
                switch (status) {
                    case 'ZERO_RESULTS': errorMessage = 'No results found for this address.'; break;
                    case 'OVER_QUERY_LIMIT': errorMessage = 'Geocoding service is temporarily unavailable.'; break;
                    case 'REQUEST_DENIED': errorMessage = 'Geocoding request was denied.'; break;
                    case 'INVALID_REQUEST': errorMessage = 'The address provided is invalid.'; break;
                    default: errorMessage = `Geocoding failed: ${status}`;
                }
                reject(new Error(errorMessage));
            }
        });
    });
}

// Form submission handler
async function handleSubmit(event) {
    event.preventDefault();
    showLoading(true, 'Processing your submission...');
    try {
        if (!app || !auth || !db) {
            showLoading(false);
            showPopup('Error', 'Firebase services are not ready. Please try again.', 'error');
            return;
        }
        if (!currentUser) {
            showLoading(false);
            showPopup('Authentication Required', 'Please log in to list a parking spot.', 'error', () => {
                window.location.href = 'login.html';
            });
            return;
        }
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        const address = document.getElementById('address').value;
        const type = document.getElementById('type').value;
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const contactNumber = document.getElementById('contact').value;
        const additionalNotes = document.getElementById('notes').value;
        const dayCheckboxes = document.querySelectorAll('input[name="days"]:checked');
        const days = Array.from(dayCheckboxes).map(cb => cb.value);

        if (!address || !type || !startTime || !endTime || !contactNumber || days.length === 0) {
            showPopup('Missing Information', 'Please fill in all required fields.', 'error');
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            showLoading(false);
            return;
        }

        updateLoadingMessage('Geocoding address...');
        let geoLocation;
        try {
            if (!window.google || !window.google.maps) throw new Error('Google Maps API not available. Please refresh the page.');
            const geocodePromise = geocodeAddress(address);
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Geocoding process timed out.')), 20000));
            geoLocation = await Promise.race([geocodePromise, timeoutPromise]);
            if (!geoLocation || !geoLocation.latitude || !geoLocation.longitude) throw new Error('Geocoding returned invalid coordinates');
        } catch (geocodeError) {
            showLoading(false);
            showPopup('Address Error', `Failed to geocode address: ${geocodeError.message}`, 'error');
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            return;
        }

        updateLoadingMessage('Saving your listing...');
        const parkingSpotData = {
            address: geoLocation.formattedAddress || address,
            type,
            availability: { startTime, endTime, days },
            contactNumber,
            additionalNotes: additionalNotes || '',
            ownerUID: currentUser.uid,
            createdAt: serverTimestamp(),
            location: { latitude: geoLocation.latitude, longitude: geoLocation.longitude }
        };

        try {
            const parkingSpotsRef = collection(db, 'parkingSpots');
            const docRef = await addDoc(parkingSpotsRef, parkingSpotData);
            showLoading(false);
            showPopup('Submitted', 'Your parking spot has been successfully submitted!', 'success', () => {
                window.location.href = 'index.html';
            });
        } catch (error) {
            showLoading(false);
            showPopup('Error', `Failed to save listing: ${error.message}`, 'error');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
    } catch (error) {
        showLoading(false);
        showPopup('Error', `Failed during submission: ${error.message}`, 'error');
        const submitButton = event.target.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    } finally {
        showLoading(false);
    }
}

// Test Firestore and Firebase functionality
function testFirebase() {
    const statusDiv = document.createElement('div');
    statusDiv.id = 'firebase-test-status';
    statusDiv.style.margin = '10px';
    statusDiv.style.padding = '10px';
    statusDiv.style.border = '1px solid #ccc';
    statusDiv.style.backgroundColor = '#f9f9f9';
    if (!app) {
        statusDiv.innerHTML = '<span style="color:red">❌ Firebase app not initialized</span>';
        document.body.appendChild(statusDiv);
        return false;
    }
    if (!auth) {
        statusDiv.innerHTML = '<span style="color:red">❌ Firebase auth not initialized</span>';
        document.body.appendChild(statusDiv);
        return false;
    }
    if (!db) {
        statusDiv.innerHTML = '<span style="color:red">❌ Firestore not initialized</span>';
        document.body.appendChild(statusDiv);
        return false;
    }
    if (!storage) {
        statusDiv.innerHTML = '<span style="color:red">❌ Firebase Storage not initialized</span>';
        document.body.appendChild(statusDiv);
        return false;
    }
    statusDiv.innerHTML = '<span style="color:green">✓ All Firebase services initialized</span>';
    document.body.appendChild(statusDiv);
    try {
        const testCollection = collection(db, 'test');
        statusDiv.innerHTML += '<br><span style="color:green">✓ Firestore collection reference created</span>';
    } catch (error) {
        statusDiv.innerHTML += '<br><span style="color:red">❌ Error creating Firestore collection reference</span>';
        return false;
    }
    return true;
}

// Function to add debug buttons
function addDebugButtons() {
    const debugPanel = document.getElementById('debug-panel');
    if (!debugPanel) return;
    if (debugPanel.querySelector('button[data-test="firebase"]')) return;
    const testButton = document.createElement('button');
    testButton.textContent = 'Test Connection';
    testButton.style.backgroundColor = '#4CAF50';
    testButton.style.color = 'white';
    testButton.style.border = 'none';
    testButton.style.padding = '10px 20px';
    testButton.style.borderRadius = '8px';
    testButton.style.fontSize = '16px';
    testButton.style.cursor = 'pointer';
    testButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    testButton.style.transition = 'background-color 0.3s ease';
    testButton.style.textAlign = 'center';
    testButton.style.display = 'inline-block'; // Ensures no extra space around the button
    testButton.style.margin = '0'; // Removes any default margin
    testButton.style.outline = 'none'; // Removes focus outline
    testButton.onmouseover = () => testButton.style.backgroundColor = '#45a049';
    testButton.onmouseout = () => testButton.style.backgroundColor = '#4CAF50';
    testButton.onclick = testFirebase;
    debugPanel.appendChild(testButton);
}

// DOMContentLoaded logic
document.addEventListener('DOMContentLoaded', () => {
    const parkingForm = document.getElementById('parkingForm');

    parkingForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the default form submission behavior

        // Show the loading overlay
        const loadingOverlay = document.getElementById('loading-overlay');
        loadingOverlay.style.display = 'flex';

        // Simulate form processing (e.g., saving data to Firebase or server)
        setTimeout(() => {
            // Hide the loading overlay
            loadingOverlay.style.display = 'none';

            // Show a success message (optional)
            alert('Parking spot listed successfully!');

            // Redirect to index.html
            window.location.href = 'index.html';
        }, 2000); // Simulate a 2-second delay for processing
    });

    if (!parkingForm) return;
    if (!window.google || !window.google.maps) {
        updateDebugStatus('form-status', 'Google Maps API not loaded', true);
    }
    updateDebugStatus('firebase-status', app ? 'Firebase App initialized' : 'Firebase not initialized', !app);
    updateDebugStatus('auth-status', auth ? 'Auth initialized' : 'Auth not initialized', !auth);
    updateDebugStatus('firestore-status', db ? 'Firestore initialized' : 'Firestore not initialized', !db);
    updateDebugStatus('storage-status', storage ? 'Storage initialized' : 'Storage not initialized', !storage);
    if (!app || !auth || !db || !storage) {
        initializeFirebase().then(success => {
            if (!success) showPopup('Error', 'Failed to initialize Firebase. Please refresh the page.', 'error');
        }).catch(error => {
            showPopup('Error', `Firebase initialization error: ${error.message}`, 'error');
        });
    } else {
        setupForm();
    }
    const popupOverlay = document.getElementById('custom-popup');
    if (popupOverlay) {
        popupOverlay.addEventListener('click', (event) => {
            if (event.target === popupOverlay) hidePopup();
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && popupOverlay.classList.contains('show')) hidePopup();
        });
    }
    addDebugButtons();
});

// Export functions for testing
export { handleSubmit, initializeFirebase, setupForm, showPopup, hidePopup };

console.log('listspot.js fully loaded and initialized');