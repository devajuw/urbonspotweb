// JS/map-main.js - Main map functionality with environment variables
let map, userLocationMarker;
let firestoreMarkers = [];
let jsonMarkers = [];
let userLocation = null;

// Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase (guard against duplicate init)
if (!firebase.apps || firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Ensure we have read permission: try anonymous auth when rules require auth
async function signInIfNeeded() {
    try {
        if (!firebase.auth) return null; // auth not loaded
        const auth = firebase.auth();
        if (auth.currentUser) return auth.currentUser;
        const result = await auth.signInAnonymously();
        return result.user || null;
    } catch (error) {
        console.warn('Anonymous sign-in failed or not permitted:', error);
        return null;
    }
}

// Function to add markers from Firestore
async function addFirestoreMarkers() {
    try {
        // Clear existing markers
        firestoreMarkers.forEach(marker => marker.map = null);
        firestoreMarkers = [];
        
        console.log("Fetching parking spots from Firestore...");
        
        // Get documents from 'parkingSpots' collection
        // Note: Make sure Firestore security rules allow read access
        const querySnapshot = await db.collection('parkingSpots').get();
        console.log(`Retrieved ${querySnapshot.size} parking spots`);
        
        if (querySnapshot.empty) {
            console.warn("No parking spots found in database");
            return;
        }
        
        // Process each document
        querySnapshot.forEach(doc => {
            try {
                const data = doc.data();
                let position;
                
                // Handle different possible location formats
                if (data.location && 
                    typeof data.location.latitude === 'number' && 
                    typeof data.location.longitude === 'number') {
                    position = {
                        lat: data.location.latitude,
                        lng: data.location.longitude
                    };
                } else if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
                    position = {
                        lat: data.latitude,
                        lng: data.longitude
                    };
                } else {
                    console.warn(`Invalid location data in document ${doc.id}:`, data);
                    return;
                }
                
                console.log(`Creating marker at position:`, position);
                
                // Create marker
                const marker = new google.maps.marker.AdvancedMarkerElement({
                    position: position,
                    map: map,
                    title: data.address || 'Parking Spot',
                    content: (() => { const img = document.createElement('img'); img.src = "http://maps.google.com/mapfiles/ms/icons/red-dot.png"; img.width = 40; img.height = 40; return img; })()
                });
                
                // Create info window with parking spot details
                const infoWindow = new google.maps.InfoWindow({
                    content: `<div style="min-width:200px">
                                <h3>${data.address || 'Parking Spot'}</h3>
                                <p>₹${data.hourlyRate || 0}/hour</p>
                                ${data.description ? `<p>${data.description}</p>` : ''}
                                <button onclick="window.location.href='/HTML/marker.html?lat=${position.lat}&lng=${position.lng}&name=${encodeURIComponent(data.address || 'Parking Spot')}&placeId=${data.placeId || ''}'"
                                    style="background-color:#34A853;color:white;border:none;
                                    padding:8px 16px;border-radius:4px;cursor:pointer;margin-top:8px">
                                    View Details
                                </button>
                            </div>`
                });
                
                // Add click listener to show info window
                marker.addListener('click', () => {
                    // Close all open info windows first
                    firestoreMarkers.forEach(m => {
                        if (m.infoWindow && m.infoWindow.getMap()) {
                            m.infoWindow.close();
                        }
                    });
                    jsonMarkers.forEach(m => {
                        if (m.infoWindow && m.infoWindow.getMap()) {
                            m.infoWindow.close();
                        }
                    });
                    
                    infoWindow.open(map, marker);
                });
                
                // Store reference to info window
                marker.infoWindow = infoWindow;
                firestoreMarkers.push(marker);
            } catch (error) {
                console.error(`Error processing document ${doc.id}:`, error);
            }
        });
        
        console.log(`Successfully added ${firestoreMarkers.length} markers to the map`);
    } catch (error) {
        console.error("Error fetching parking spots:", error);
        console.warn("Firebase access denied. Make sure Firestore security rules allow read access or you're authenticated.");
        // Continue with static markers only
    }
}

// Function to add markers for Ranchi
function addJsonMarkers() {
    // Clear existing markers
    jsonMarkers.forEach(marker => marker.map = null);
    jsonMarkers = [];
    
    // Ranchi parking spots data
    const ranchiParkingSpots = [
        {
            "name": "Firayalal Parking",
            "description": "Secure parking near Firayalal shopping complex",
            "position": { "lat": 23.3639, "lng": 85.3332 },
            "hourlyRate": 30
        },
        {
            "name": "Morabadi Ground Parking",
            "description": "Large parking area near Morabadi Ground",
            "position": { "lat": 23.3708, "lng": 85.3245 },
            "hourlyRate": 20
        },
        {
            "name": "Ranchi Railway Station Parking",
            "description": "24/7 parking facility at railway station",
            "position": { "lat": 23.3593, "lng": 85.3336 },
            "hourlyRate": 40
        },
        {
            "name": "Ratu Road Parking Lot",
            "description": "Covered parking with security guard",
            "position": { "lat": 23.3772, "lng": 85.3216 },
            "hourlyRate": 25
        },
        {
            "name": "Kanke Road Multi-level Parking",
            "description": "Modern multi-level parking facility",
            "position": { "lat": 23.3821, "lng": 85.3389 },
            "hourlyRate": 35
        }
    ];
    
    ranchiParkingSpots.forEach((location, index) => {
        const marker = new google.maps.marker.AdvancedMarkerElement({
            position: location.position,
            map: map,
            title: location.name,
            content: (() => { const img = document.createElement('img'); img.src = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"; img.width = 40; img.height = 40; return img; })()
        });
        
        // Create info window
        const infoWindow = new google.maps.InfoWindow({
            content: `<div style="min-width:200px">
                        <h3>${location.name}</h3>
                        <p>${location.description}</p>
                        <button onclick="window.location.href='/HTML/marker.html?lat=${location.position.lat}&lng=${location.position.lng}&name=${encodeURIComponent(location.name)}'"
                            style="background-color:#34A853;color:white;border:none;
                            padding:8px 16px;border-radius:4px;cursor:pointer;margin-top:8px">
                            View Details
                        </button>
                    </div>`
        });
        
        marker.addListener('click', () => {
            // Close all open info windows first
            firestoreMarkers.forEach(m => {
                if (m.infoWindow && m.infoWindow.getMap()) {
                    m.infoWindow.close();
                }
            });
            jsonMarkers.forEach(m => {
                if (m.infoWindow && m.infoWindow.getMap()) {
                    m.infoWindow.close();
                }
            });
            
            infoWindow.open(map, marker);
        });
        
        marker.infoWindow = infoWindow;
        jsonMarkers.push(marker);
    });
}

// Initialize map after DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Google Maps to load
    const checkGoogleMaps = () => {
        if (typeof google !== 'undefined' && google.maps) {
            initMap();
        } else {
            setTimeout(checkGoogleMaps, 100);
        }
    };
    checkGoogleMaps();
});

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), { mapId: "DEMO_MAP_ID",
        zoom: 14,
        center: { lat: 23.3708, lng: 85.3245 }, // Center on Ranchi
        gestureHandling: 'cooperative',
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
            {
                "featureType": "poi.park",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#d5f5d5"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [
                    {
                        "lightness": 100
                    },
                    {
                        "visibility": "simplified"
                    }
                ]
            }
        ]
    });

    // Load markers from both sources
    // Attempt anon sign-in first (if required by Firestore rules), then fetch
    signInIfNeeded().finally(() => {
        addFirestoreMarkers();
    });
    addJsonMarkers();

    document.getElementById('show-my-location').addEventListener('click', function() {
        // Show loading indicator or button state
        this.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 8px;">
            <path d="M8 1a7 7 0 0 1 7 7 7 7 0 0 1-1.582 4.5l1.062 1.062A8 8 0 0 0 16 8a8 8 0 0 0-8-8 8 8 0 0 0-1.48 7.562l1.062-1.062A7 7 0 0 1 8 1z"/>
            <path d="M4.283 4.5a8 8 0 0 0 9.217 9.217l1.062-1.062a7 7 0 0 1-9.217-9.217L4.283 4.5zM8 3.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z"/>
        </svg> Locating...`;
        this.disabled = true;
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                console.log("User location found:", userLocation);
                
                if (userLocationMarker) userLocationMarker.map = null;
                
                userLocationMarker = new google.maps.marker.AdvancedMarkerElement({
                    position: userLocation,
                    map: map,
                    title: "Your Current Location",
                    content: (() => { const img = document.createElement('img'); img.src = "http://maps.google.com/mapfiles/ms/icons/green-dot.png"; img.width = 40; img.height = 40; return img; })()
                });
                
                // Create info window for user location
                const infoWindow = new google.maps.InfoWindow({
                    content: "<div><strong>You are here</strong></div>"
                });
                
                // Add click listener to marker to show info window
                userLocationMarker.addListener('click', function() {
                    infoWindow.open(map, userLocationMarker);
                });
                
                // First pan to the location
                map.panTo(userLocation);
                
                // Then set zoom after a short delay to ensure smooth transition
                setTimeout(function() {
                    map.setZoom(16);
                }, 300);
                
                // Reset button state
                document.getElementById('show-my-location').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 8px;">
                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                </svg> Show My Location`;
                document.getElementById('show-my-location').disabled = false;
            }, 
            function(error) {
                console.error("Geolocation error:", error);
                alert("Unable to access your location: " + error.message);
                
                // Reset button state
                document.getElementById('show-my-location').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 8px;">
                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                </svg> Show My Location`;
                document.getElementById('show-my-location').disabled = false;
            }, 
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        } else {
            alert("Geolocation is not supported by this browser.");
            
            // Reset button state
            document.getElementById('show-my-location').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 8px;">
                <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
            </svg> Show My Location`;
            document.getElementById('show-my-location').disabled = false;
        }
    });
}
