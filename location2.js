// location.js - Handles map display and parking spot markers
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

// Firebase configuration - must match the one in config.js
const firebaseConfig = {
  apiKey: "AIzaSyB5rM-Z_YxL6mpPb5qX3S7A-ykBshAA_Ro",
  authDomain: "dev-85f8d.firebaseapp.com",
  projectId: "dev-85f8d",
  storageBucket: "dev-85f8d.firebasestorage.app",
  messagingSenderId: "884673937857",
  appId: "1:884673937857:web:97943fdefae91ccfe36f40",
  measurementId: "G-4CR2VG9QTK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global variables
let map;
let markers = [];
let markerLocations = [];
let userLocation = null;

// Helper function to calculate distance between two coordinates
function getDistanceInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to create markers on the map
function spawnMarkers(filteredLocations = []) {
    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));
    markers = [];

    // Create new markers for each location
    for (let i = 0; i < filteredLocations.length; i++) {
        const markerData = filteredLocations[i];
        
        // Ensure location data exists
        if (!markerData.location || typeof markerData.location.latitude === 'undefined') {
            console.error('Invalid marker data:', markerData);
            continue;
        }
        
        // Create marker
        const marker = new google.maps.Marker({
            position: {
                lat: markerData.location.latitude,
                lng: markerData.location.longitude
            },
            map: map,
            label: (i + 1).toString(),
            animation: google.maps.Animation.DROP,
            draggable: false,
        });

        markers.push(marker);

        // Format days of availability
        let daysText = '';
        if (markerData.availability && markerData.availability.days) {
            const daysMap = {
                'mon': 'Monday',
                'tue': 'Tuesday',
                'wed': 'Wednesday',
                'thu': 'Thursday',
                'fri': 'Friday',
                'sat': 'Saturday',
                'sun': 'Sunday'
            };
            daysText = markerData.availability.days
                .map(day => daysMap[day] || day)
                .join(', ');
        }

        // Create an info window for each marker
        const infoContent = `
            <div class="info-window">
                <h3>${markerData.address || 'Parking Spot'}</h3>
                <p><strong>Type:</strong> ${capitalizeFirstLetter(markerData.type)} Parking</p>
                <p><strong>Rate:</strong> ₹${markerData.hourlyRate}/hour</p>
                ${markerData.availability ? 
                    `<p><strong>Available:</strong> ${markerData.availability.startTime || ''} to ${markerData.availability.endTime || ''}</p>
                    <p><strong>Days:</strong> ${daysText}</p>` : ''}
                <button onclick="viewDetails('${markerData.id}')">View Details</button>
            </div>
        `;

        const infoWindow = new google.maps.InfoWindow({
            content: infoContent
        });

        // Add click handler to show info window
        marker.addListener('click', () => {
            // Close all other info windows first
            markers.forEach(m => {
                if (m.infoWindow && m !== marker) {
                    m.infoWindow.close();
                }
            });
            
            infoWindow.open(map, marker);
            marker.infoWindow = infoWindow;
        });

        // Add double-click handler to navigate to details page
        marker.addListener('dblclick', () => {
            viewDetails(markerData.id);
        });
    }
}

// Function to fetch parking spots from Firestore
async function fetchParkingSpots() {
    try {
        const loadingElement = document.getElementById('loading-indicator');
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }

        const parkingSpotsCollection = collection(db, 'parkingSpots');
        const querySnapshot = await getDocs(parkingSpotsCollection);
        
        const spots = [];
        querySnapshot.forEach((doc) => {
            // Convert Firestore timestamp to JS Date if needed
            const data = doc.data();
            if (data.createdAt && typeof data.createdAt.toDate === 'function') {
                data.createdAt = data.createdAt.toDate();
            }
            
            spots.push({
                id: doc.id,
                ...data
            });
        });
        
        console.log('Fetched parking spots:', spots);
        return spots;
    } catch (error) {
        console.error('Error fetching parking spots:', error);
        // Display error message to the user
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = 'Failed to load parking spots. Please try again later.';
            errorElement.style.display = 'block';
        }
        return [];
    } finally {
        const loadingElement = document.getElementById('loading-indicator');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
}

// Initialize map when API is loaded
function initMap() {
    try {
        // Create map centered on India
        map = new google.maps.Map(document.getElementById("map"), {
            zoom: 5,
            center: { lat: 20.5937, lng: 78.9629 },
            mapTypeId: "terrain",
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true
        });

        // Show a loading message until spots are loaded
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-indicator';
        loadingDiv.style.position = 'absolute';
        loadingDiv.style.top = '50%';
        loadingDiv.style.left = '50%';
        loadingDiv.style.transform = 'translate(-50%, -50%)';
        loadingDiv.style.backgroundColor = 'white';
        loadingDiv.style.padding = '10px';
        loadingDiv.style.borderRadius = '5px';
        loadingDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        loadingDiv.style.zIndex = '1000';
        loadingDiv.textContent = 'Loading parking spots...';
        document.getElementById('map').appendChild(loadingDiv);

        // Create an error message element (hidden by default)
        const errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.style.position = 'absolute';
        errorDiv.style.top = '10px';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translateX(-50%)';
        errorDiv.style.backgroundColor = '#f8d7da';
        errorDiv.style.color = '#721c24';
        errorDiv.style.padding = '10px';
        errorDiv.style.borderRadius = '5px';
        errorDiv.style.display = 'none';
        errorDiv.style.zIndex = '1000';
        document.getElementById('map').appendChild(errorDiv);

        console.log('Map initialized successfully');
    } catch (error) {
        console.error('Error initializing map:', error);
        alert('Failed to initialize the map. Please refresh the page and try again.');
    }
}

// Function called when user's location is obtained
async function initMapFromScript(location, rangeValue = 0) {
    try {
        // Set user location and update map center
        userLocation = location;
        map.setCenter(userLocation);
        map.setZoom(15);

        // Add a marker for the user's location
        new google.maps.Marker({
            position: userLocation,
            map: map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2
            },
            title: 'Your Location',
            zIndex: 1000 // Ensure user marker is on top
        });

        // Add a circle showing the range
        if (rangeValue > 0) {
            new google.maps.Circle({
                strokeColor: '#4285F4',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#4285F4',
                fillOpacity: 0.1,
                map: map,
                center: userLocation,
                radius: rangeValue * 1000 // Convert km to meters
            });
        }

        // Fetch parking spots from Firestore
        markerLocations = await fetchParkingSpots();
        
        // If no parking spots found, use sample data during development
        if (markerLocations.length === 0) {
            console.log('No parking spots found in Firestore, using sample data');
            markerLocations = [
                { 
                    id: '1',
                    address: 'New Delhi',
                    type: 'street',
                    hourlyRate: 50,
                    location: { latitude: 28.6139, longitude: 77.2090 },
                    availability: {
                        startTime: '09:00',
                        endTime: '18:00',
                        days: ['mon', 'tue', 'wed', 'thu', 'fri']
                    }
                },
                { 
                    id: '2',
                    address: 'Mumbai',
                    type: 'garage',
                    hourlyRate: 75,
                    location: { latitude: 19.0760, longitude: 72.8777 },
                    availability: {
                        startTime: '08:00',
                        endTime: '20:00',
                        days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
                    }
                },
                { 
                    id: '3',
                    address: 'Bangalore',
                    type: 'lot',
                    hourlyRate: 60,
                    location: { latitude: 12.9716, longitude: 77.5946 },
                    availability: {
                        startTime: '07:00',
                        endTime: '22:00',
                        days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']
                    }
                },
                { 
                    id: '4',
                    address: 'Kolkata',
                    type: 'driveway',
                    hourlyRate: 45,
                    location: { latitude: 22.5726, longitude: 88.3639 },
                    availability: {
                        startTime: '10:00',
                        endTime: '19:00',
                        days: ['mon', 'wed', 'fri']
                    }
                },
                { 
                    id: '5',
                    address: 'Chennai',
                    type: 'street',
                    hourlyRate: 55,
                    location: { latitude: 13.0827, longitude: 80.2707 },
                    availability: {
                        startTime: '09:30',
                        endTime: '17:30',
                        days: ['mon', 'tue', 'wed', 'thu', 'fri']
                    }
                }
            ];
        }

        // Filter markers based on range
        const filteredMarkers = rangeValue === 0
            ? markerLocations
            : markerLocations.filter(spot => {
                // Calculate distance between user and parking spot
                const distance = getDistanceInKm(
                    userLocation.lat,
                    userLocation.lng,
                    spot.location.latitude,
                    spot.location.longitude
                );
                return distance <= rangeValue;
            });

        // Display filtered markers on the map
        spawnMarkers(filteredMarkers);

        // Update marker count if element exists
        const markerCountElement = document.getElementById('marker-count');
        if (markerCountElement) {
            markerCountElement.textContent = `${filteredMarkers.length} parking spots found`;
        }
    } catch (error) {
        console.error('Error initializing map with user location:', error);
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = 'Failed to load the map with your location. Please try again.';
            errorElement.style.display = 'block';
        }
    }
}

// Function to navigate to parking spot details
function viewDetails(spotId) {
    let url = `marker.html?id=${spotId}`;
    if (userLocation) {
        url += `&userLat=${userLocation.lat}&userLng=${userLocation.lng}`;
    }
    window.location.href = url;
}

// Make functions available globally
window.initMapFromScript = initMapFromScript;
window.viewDetails = viewDetails;

// Load Google Maps API
function loadGoogleMaps() {
    try {
        // Check if script is already loaded
        if (document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
            console.log('Google Maps API already loaded');
            return;
        }

        const script = document.createElement("script");
        script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAlUjF8he099BRUCD-B5_6QGuyRDUNESFY&callback=initMap";
        script.defer = true;
        script.async = true;
        script.onerror = function() {
            console.error('Failed to load Google Maps API');
            alert('Failed to load Google Maps. Please check your internet connection and try again.');
        };
        document.head.appendChild(script);
        console.log('Google Maps API script added to document');
    } catch (error) {
        console.error('Error loading Google Maps:', error);
    }
}

// Load the Google Maps API
loadGoogleMaps();
