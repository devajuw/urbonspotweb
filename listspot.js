// listspot.js - Handles parking space listing form submission to Firebase

// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js';

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

// Function to show/hide loading overlay
function showLoading(show = true, message = 'Processing...') {
    isLoading = show; // Update loading state tracker
    const loadingOverlay = document.getElementById('loading-overlay');
    if (!loadingOverlay) {
        return;
    }
    
    if (show) {
        const messageElement = loadingOverlay.querySelector('p');
        if (messageElement) {
            messageElement.textContent = message;
        }
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
        if (messageElement) {
            messageElement.textContent = message;
        }
    }
}

// Show/hide popup function
function showPopup(title, message, type = 'default', callback = null) {
    try {
        const popupOverlay = document.getElementById('custom-popup');
        if (!popupOverlay) {
            alert(`${title}: ${message}`);
            return;
        }
        
        const popup = popupOverlay.querySelector('.popup');
        const popupTitle = popupOverlay.querySelector('.popup-title');
        const popupMessage = popupOverlay.querySelector('.popup-message');
        const popupButton = popupOverlay.querySelector('.popup-button');
        
        // Remove existing classes
        popup.classList.remove('success', 'error');
        
        // Add type class
        if (type === 'success' || type === 'error') {
            popup.classList.add(type);
        }
        
        // Set content
        popupTitle.textContent = title;
        popupMessage.textContent = message;
        
        // Show popup
        popupOverlay.classList.add('show');
        
        // Setup close handlers
        const closePopup = () => {
            popupOverlay.classList.remove('show');
            if (typeof callback === 'function') {
                setTimeout(callback, 300);
            }
        };
        
        popupButton.onclick = closePopup;
        popupOverlay.querySelector('.popup-close').onclick = closePopup;
        
        // Also close on outside click
        popupOverlay.onclick = (event) => {
            if (event.target === popupOverlay) {
                closePopup();
            }
        };
    } catch (error) {
        alert(`${title}: ${message}`);
    }
}

// Hide popup function
function hidePopup() {
    const popupOverlay = document.getElementById('custom-popup');
    if (popupOverlay) {
        popupOverlay.classList.remove('show');
    }
}

// Initialize Firebase
async function initializeFirebase() {
    showLoading(true, 'Initializing Firebase...');
    
    try {
        // Initialize Firebase services
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        
        // Setup form and auth
        setupForm();
        
        showLoading(false);
        
        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        showLoading(false);
        showPopup('Firebase Error', 'Failed to initialize Firebase: ' + error.message, 'error');
        
        return false;
    }
}

// Setup form and authentication
function setupForm() {
    // Get form elements
    parkingForm = document.getElementById('parkingForm');
    photoInput = document.getElementById('photo');
    
    if (!parkingForm) {
        showPopup('Error', 'Form not found. Please refresh the page.', 'error');
        return;
    }
    
    // Attach submit handler - only once
    if (!parkingForm._hasSubmitListener) {
        parkingForm.addEventListener('submit', handleSubmit);
        parkingForm._hasSubmitListener = true;
    }
    
    // Setup auth listener
    if (auth) {
        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            
            const submitButton = parkingForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = !user;
            }
            
            // Handle auth message
            if (!user) {
                // Add sign in message
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
                // Remove sign in message if exists
                const authMessage = document.getElementById('auth-message');
                if (authMessage) {
                    authMessage.remove();
                }
            }
        });
    }
}

// Geocode address to get coordinates
async function geocodeAddress(address) {
  // Check if Google Maps API is loaded
  if (!window.google || !window.google.maps) {
    throw new Error('Google Maps API not loaded');
  }
  
  return new Promise((resolve, reject) => {
    // Create a timeout for the geocoding operation - 15 seconds
    const timeoutId = setTimeout(() => {
      reject(new Error('Geocoding timed out. Please try again or use a more specific address.'));
    }, 15000);
    
    try {
      const geocoder = new google.maps.Geocoder();
      
      // Validate address format
      if (!address || typeof address !== 'string' || address.trim() === '') {
        clearTimeout(timeoutId);
        reject(new Error('Invalid address format'));
        return;
      }
      
      geocoder.geocode({ address }, (results, status) => {
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        
        if (status === 'OK' && results && results[0]) {
          if (!results[0].geometry || !results[0].geometry.location) {
            reject(new Error('Invalid geocoding response: missing location data'));
            return;
          }
          
          const location = results[0].geometry.location;
          const coords = {
            latitude: location.lat(),
            longitude: location.lng(),
            formattedAddress: results[0].formatted_address
          };
          
          // Validate coordinates
          if (isNaN(coords.latitude) || isNaN(coords.longitude)) {
            reject(new Error('Invalid coordinates returned'));
            return;
          }
          
          resolve(coords);
        } else {
          // Provide more specific error messages based on status
          let errorMessage;
          switch (status) {
            case 'ZERO_RESULTS':
              errorMessage = 'No results found for this address. Please check the address and try again.';
              break;
            case 'OVER_QUERY_LIMIT':
              errorMessage = 'Geocoding service is temporarily unavailable due to request limits. Please try again later.';
              break;
            case 'REQUEST_DENIED':
              errorMessage = 'Geocoding request was denied. This might be an API key issue.';
              break;
            case 'INVALID_REQUEST':
              errorMessage = 'The address provided is invalid or incomplete.';
              break;
            default:
              errorMessage = `Geocoding failed: ${status}`;
          }
          
          reject(new Error(errorMessage));
        }
      });
    } catch (error) {
      // Clear the timeout if there's an exception
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

// Upload photo to Firebase Storage
async function uploadPhoto(file, userId) {
    if (!file) {
        return null;
    }
    
    if (!storage) {
        try {
            // Attempt to reinitialize storage
            if (app) {
                storage = getStorage(app);
            } else {
                console.error('Cannot reinitialize storage: Firebase app not available');
                return null;
            }
        } catch (reinitError) {
            console.error('Failed to reinitialize storage:', reinitError);
            return null;
        }
    }
    
    if (!ref || typeof ref !== 'function') {
        console.error('Firebase Storage ref function is not available');
        return null;
    }
    
    try {
        const timestamp = new Date().getTime();
        const fileName = `parking_spots/${userId}/${timestamp}_${file.name}`;
        
        // Create storage reference
        const storageRef = ref(storage, fileName);
        
        // Verify the storage reference is valid
        if (!storageRef || !storageRef.fullPath) {
            throw new Error('Invalid storage reference created');
        }
        
        // Set a timeout to prevent indefinite waiting
        const uploadPromise = uploadBytes(storageRef, file);
        
        // Create a timeout promise that rejects after 60 seconds
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Upload timeout - taking too long')), 60000);
        });
        
        // Race the upload against the timeout
        const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
        
        // Also add timeout for getting the download URL
        const urlPromise = getDownloadURL(snapshot.ref);
        const urlTimeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Download URL timeout')), 20000);
        });
        
        const downloadURL = await Promise.race([urlPromise, urlTimeoutPromise]);
        
        // Verify URL
        if (!downloadURL || !downloadURL.startsWith('https://')) {
            throw new Error('Invalid download URL format');
        }
        
        return downloadURL;
    } catch (error) {
        console.error('Photo upload failed:', error);
        // Don't throw, just return null
        return null;
    }
}

// Form submission handler
async function handleSubmit(event) {
  let submitStage = 'starting';
  
  event.preventDefault();
  
  // Show loading indicator immediately
  let loadingShown = false;
  try {
    submitStage = 'showing loading indicator';
    showLoading(true, 'Processing your submission...');
    loadingShown = true;
    
    // Firebase check
    submitStage = 'checking Firebase services';
    
    if (!app || !auth || !db || !storage) {
      showLoading(false);
      showPopup('Error', 'Firebase services are not ready. Please try again.', 'error');
      return;
    }
    
    // Auth check
    submitStage = 'checking authentication';
    
    if (!currentUser) {
      showLoading(false);
      showPopup('Authentication Required', 'Please log in to list a parking spot.', 'error', () => {
        window.location.href = 'login.html';
      });
      return;
    }
    
    // Show loading state
    submitStage = 'updating button state';
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    
    // Get form values
    submitStage = 'getting form values';
    
    const address = document.getElementById('address').value;
    const type = document.getElementById('type').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const hourlyRate = parseFloat(document.getElementById('price').value);
    const contactNumber = document.getElementById('contact').value;
    const additionalNotes = document.getElementById('notes').value;
    const photoFile = photoInput.files[0];
    
    // Get selected days
    submitStage = 'getting selected days';
    
    const dayCheckboxes = document.querySelectorAll('input[name="days"]:checked');
    const days = Array.from(dayCheckboxes).map(cb => cb.value);
    
    // Validate form
    submitStage = 'validating form';
    
    if (!address || !type || !startTime || !endTime || isNaN(hourlyRate) || !contactNumber || days.length === 0) {
      try {
        showPopup('Missing Information', 'Please fill in all required fields.', 'error');
      } catch (popupError) {
        console.error('Error showing validation popup:', popupError);
        alert('Please fill in all required fields.');
      }
      
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
      showLoading(false);
      return;
    }
    
    // Geocode address
    submitStage = 'geocoding address';
    
    let geoLocation;
    try {
        updateLoadingMessage('Geocoding address...');  // Update message only
        
        // Check if Google Maps API is available
        if (!window.google || !window.google.maps) {
            throw new Error('Google Maps API not available. Please refresh the page.');
        }
        
        // Create a timeout promise for the entire geocoding operation
        const geocodePromise = geocodeAddress(address);
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Geocoding process timed out. The service might be unavailable.')), 20000);
        });
        
        // Race the geocoding against the timeout
        geoLocation = await Promise.race([geocodePromise, timeoutPromise]);
        
        if (!geoLocation || !geoLocation.latitude || !geoLocation.longitude) {
            throw new Error('Geocoding returned invalid coordinates');
        }
        
        // Validate the geocoded coordinates
        if (Math.abs(geoLocation.latitude) > 90 || Math.abs(geoLocation.longitude) > 180) {
            throw new Error('Geocoding returned invalid coordinate range');
        }
    } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError);
        
        showLoading(false);  // Hide loading on error
        showPopup('Address Error', `Failed to geocode address: ${geocodeError.message}. Please check the address and try again.`, 'error');
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        return;
    }

    // Update loading message for next stage
    updateLoadingMessage('Processing submission...');
    
    // Upload photo if provided
    submitStage = 'uploading photo';
    
    let photoURL = null;
    if (photoFile) {
        try {
            updateLoadingMessage('Uploading photo...');  // Update message only
            
            // Add a timeout to ensure we don't wait indefinitely
            const uploadPromise = uploadPhoto(photoFile, currentUser.uid);
            const timeoutPromise = new Promise((resolve) => {
                setTimeout(() => {
                    resolve(null);
                }, 90000); // 90 seconds timeout
            });
            
            // Use Promise.race to either get the result or timeout
            photoURL = await Promise.race([uploadPromise, timeoutPromise]);
            
            if (!photoURL) {
                updateLoadingMessage('Continuing without photo...');
            }
        } catch (photoError) {
            console.error('Photo upload error:', photoError);
            // Continue without photo, but update loading message
            updateLoadingMessage('Continuing without photo...');
            photoURL = null;
        }
    }
    // Update loading message for Firestore submission
    updateLoadingMessage('Saving your listing...');

    // Continue with Firestore submission regardless of photo status
    submitStage = 'preparing data';

    const parkingSpotData = {
      address: geoLocation.formattedAddress || address,
      type,
      availability: {
        startTime,
        endTime,
        days
      },
      hourlyRate,
      contactNumber,
      additionalNotes: additionalNotes || '',
      photoURL: photoURL && photoURL.startsWith('https://') ? photoURL : null,
      hasPhoto: !!photoURL,
      ownerUID: currentUser.uid,
      createdAt: serverTimestamp(),
      location: {
        latitude: geoLocation.latitude,
        longitude: geoLocation.longitude
      }
    };
    
    // Save to Firestore
    submitStage = 'saving to firestore';
    
    try {
        // Verify Firestore is initialized
        if (!db) {
            throw new Error('Firestore is not initialized');
        }
        
        const parkingSpotsRef = collection(db, 'parkingSpots');
        const docRef = await addDoc(parkingSpotsRef, parkingSpotData);
        
        // Success! Hide loading and show popup
        showLoading(false);
        showPopup('Success!', 'Your parking spot has been listed successfully.', 'success', () => {
            window.location.href = 'index.html';
        });
        
        // Reset form
        parkingForm.reset();
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    } catch (error) {
        console.error('Error saving to Firestore:', error);
        // Ensure loading is hidden
        showLoading(false);
        
        // Show error popup
        showPopup('Error', `Failed to save listing: ${error.message}`, 'error');
        
        // Reset button state
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    }
  } catch (error) {
    console.error(`Error during ${submitStage}:`, error);
    if (loadingShown) {
      showLoading(false);
    }
    showPopup('Error', `Failed during ${submitStage}: ${error.message}`, 'error');
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  } finally {
    // Ensure loading overlay is hidden
    if (loadingShown) {
      showLoading(false);
      const loadingOverlay = document.getElementById('loading-overlay');
      if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
      }
    }
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the correct page
    const parkingForm = document.getElementById('parkingForm');
    if (!parkingForm) {
        return;
    }
    
    // Initialize Firebase if not already done
    if (!app || !auth || !db || !storage) {
        initializeFirebase().then(success => {
            if (!success) {
                showPopup('Error', 'Failed to initialize Firebase. Please refresh the page.', 'error');
            }
        }).catch(error => {
            showPopup('Error', `Firebase initialization error: ${error.message}`, 'error');
        });
    } else {
        // Firebase is already initialized, just setup the form
        setupForm();
    }
    
    // Setup popup event listeners
    const popupOverlay = document.getElementById('custom-popup');
    if (popupOverlay) {
        popupOverlay.addEventListener('click', (event) => {
            if (event.target === popupOverlay) {
                hidePopup();
            }
        });
        
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && popupOverlay.classList.contains('show')) {
                hidePopup();
            }
        });
    }
});

// Export functions
export { handleSubmit, initializeFirebase, setupForm, showPopup, hidePopup };
