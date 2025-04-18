// location.js
let map;
let markers = [];
let markerLocations = [];
let userLocation = null;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 5,
        center: { lat: 20.5937, lng: 78.9629 },
        mapTypeId: "terrain",
    });

    function getDistanceInKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
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

    function spawnMarkers(filteredLocations = []) {
        markers.forEach((marker) => marker.setMap(null));
        markers = [];

        for (let i = 0; i < filteredLocations.length; i++) {
            const markerData = filteredLocations[i];
            const marker = new google.maps.Marker({
                position: markerData,
                map: map,
                label: markerData.label,
                animation: google.maps.Animation.DROP,
                draggable: false,
            });

            markers.push(marker);

            google.maps.event.addListener(marker, "click", function () {
                let url = `marker.html?lat=${markerData.lat}&lng=${markerData.lng}&name=${encodeURIComponent(markerData.name)}`;
                if (userLocation) {
                    url += `&userLat=${userLocation.lat}&userLng=${userLocation.lng}`;
                }
                window.location.href = url;
            });
        }
    }

    function initMapFromScript(location, rangeValue = 0) {
        userLocation = location;
        map.setCenter(userLocation);
        map.setZoom(15);

        new google.maps.Marker({
            position: userLocation,
            map: map,
            label: {
                text: "You",
                color: "white",
                fontSize: "24px",
                fontWeight: "bold",
            },
            animation: google.maps.Animation.DROP,
            draggable: false,
        });

        markerLocations = [
            { lat: 28.6139, lng: 77.2090, label: "1", name: "New Delhi" },
            { lat: 19.0760, lng: 72.8777, label: "2", name: "Mumbai" },
            { lat: 12.9716, lng: 77.5946, label: "3", name: "Bangalore" },
            { lat: 22.5726, lng: 88.3639, label: "4", name: "Kolkata" },
            { lat: 13.0827, lng: 80.2707, label: "5", name: "Chennai" },
            { lat: 23.2599, lng: 77.4126, label: "6", name: "Bhopal" },
            { lat: 17.3850, lng: 78.4867, label: "7", name: "Hyderabad" },
            { lat: 25.5941, lng: 85.1376, label: "8", name: "Patna" },
            { lat: 31.5497, lng: 74.3436, label: "9", name: "Lahore" },
            { lat: 9.9312, lng: 76.2673, label: "10", name: "Kochi" },
        ];

        const filteredMarkers = rangeValue === 0
            ? markerLocations
            : markerLocations.filter(loc =>
                getDistanceInKm(
                    userLocation.lat,
                    userLocation.lng,
                    loc.lat,
                    loc.lng
                ) <= rangeValue
            );

        spawnMarkers(filteredMarkers);
    }

    window.initMapFromScript = initMapFromScript;
}

function loadGoogleMaps() {
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAlUjF8he099BRUCD-B5_6QGuyRDUNESFY&callback=initMap";
    script.defer = true;
    script.async = true;
    document.head.appendChild(script);
}

loadGoogleMaps();
