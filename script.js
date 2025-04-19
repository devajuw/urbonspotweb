document.getElementById("range-slider").addEventListener("input", function () {
    document.getElementById("range-value").textContent = this.value;
});

document.getElementById("get-location").addEventListener("click", function () {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            const range = parseInt(document.getElementById("range-slider").value);

            document.getElementById("output").textContent =
                `Your Location: Latitude: ${location.lat}, Longitude: ${location.lng}`;

            if (typeof window.initMapFromScript === 'function') {
                window.initMapFromScript(location, range);
            }
        }, function (error) {
            document.getElementById("output").textContent =
                `Error: ${error.message}`;
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    } else {
        document.getElementById("output").textContent =
            "Geolocation is not supported by this browser.";
    }
});

document.getElementById("reset-range").addEventListener("click", function () {
    const rangeSlider = document.getElementById("range-slider");
    rangeSlider.value = 0;
    document.getElementById("range-value").textContent = "0";

    // Re-show all markers only if location already exists
    if (typeof spawnMarkers === 'function' && window.userLocation) {
        spawnMarkers(markerLocations);
    }
});
