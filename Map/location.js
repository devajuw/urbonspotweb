let map; // The map object
let markers = []; // Array to store 10 markers

// Function to initialize the map and set the default center to India
function initMap() {
    // Initialize the map centered on India
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 5, // Initial zoom level for India
        center: { lat: 20.5937, lng: 78.9629 }, // Coordinates of India (centered on India)
        mapTypeId: "terrain",
    });
}

// Function to spawn markers after the user clicks the button
function spawnMarkers() {
    // Store 10 markers with their locations and labels
    const markerLocations = [
        { lat: 28.6139, lng: 77.2090, label: "Marker 1", name: "New Delhi" }, // New Delhi
        { lat: 19.0760, lng: 72.8777, label: "Marker 2", name: "Mumbai" }, // Mumbai
        { lat: 12.9716, lng: 77.5946, label: "Marker 3", name: "Bangalore" }, // Bangalore
        { lat: 22.5726, lng: 88.3639, label: "Marker 4", name: "Kolkata" }, // Kolkata
        { lat: 13.0827, lng: 80.2707, label: "Marker 5", name: "Chennai" }, // Chennai
        { lat: 23.2599, lng: 77.4126, label: "Marker 6", name: "Bhopal" }, // Bhopal
        { lat: 17.3850, lng: 78.4867, label: "Marker 7", name: "Hyderabad" }, // Hyderabad
        { lat: 25.5941, lng: 85.1376, label: "Marker 8", name: "Patna" }, // Patna
        { lat: 31.5497, lng: 74.3436, label: "Marker 9", name: "Lahore" }, // Lahore
        { lat: 9.9312, lng: 76.2673, label: "Marker 10", name: "Kochi" }  // Kochi
    ];

    // Loop through the markerLocations array and place markers on the map
    for (let i = 0; i < markerLocations.length; i++) {
        const marker = new google.maps.Marker({
            position: markerLocations[i],
            map: map,
            label: markerLocations[i].label,
            animation: google.maps.Animation.DROP, // Adds drop animation for markers
            draggable: false, // Make markers undraggable (fixed in place)
        });
        markers.push(marker); // Store the marker in the markers array

        // Add an event listener to the marker to open marker.html with location details
        google.maps.event.addListener(marker, 'click', function() {
            const markerData = markerLocations[i];
            window.location.href = `marker.html?lat=${markerData.lat}&lng=${markerData.lng}&name=${encodeURIComponent(markerData.name)}`;
        });
    }
}

// Function to zoom into the user's location after clicking the button
function initMapFromScript(userLocation) {
    // Center the map to the user's location and zoom in
    map.setCenter(userLocation);
    map.setZoom(15); // Zoom in for a closer view

    // Create a marker for the user's location
    const userMarker = new google.maps.Marker({
        position: userLocation,
        map: map,
        label: {
            text: "You", // The label for the user's location marker
            color: "white",
            fontSize: "24px",
            fontWeight: "bold",
        },
        animation: google.maps.Animation.DROP, // Drop animation for the marker
        draggable: false, // The user's marker is not draggable
    });
 
    // Now spawn the 10 markers after the user location is set
    spawnMarkers();
}

// Load the Google Maps API dynamically
function loadGoogleMaps() {
    const script = document.createElement('script');
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAlUjF8he099BRUCD-B5_6QGuyRDUNESFY&callback=initMap";
    script.defer = true;
    script.async = true;
    document.head.appendChild(script);
}

// Call loadGoogleMaps to initiate the API loading
loadGoogleMaps();
