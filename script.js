let userLocation;

document.getElementById("get-location").addEventListener("click", function() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            
            };

            document.getElementById("output").textContent = `Your Location: Latitude: ${userLocation.lat}, Longitude: ${userLocation.lng}`;

            if (typeof window.initMapFromScript === 'function') {
                window.initMapFromScript(userLocation);
            }
        }, function(error) {
            document.getElementById("output").textContent = `Error: ${error.message}`;
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    } else {
        document.getElementById("output").textContent = "Geolocation is not supported by this browser.";
    }
});
