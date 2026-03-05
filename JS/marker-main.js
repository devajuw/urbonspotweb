// JS/marker-main.js - Main marker page functionality with environment variables
const urlParams = new URLSearchParams(window.location.search);
const lat = parseFloat(urlParams.get("lat"));
const lng = parseFloat(urlParams.get("lng"));
const name = decodeURIComponent(urlParams.get("name"));
const userLat = urlParams.get("userLat");
const userLng = urlParams.get("userLng");

const pricing = {
  "2W": { base: 1, hourly: 0 },
  "4W_Small": { base: 20, hourly: 10 },
  "4W_SUV": { base: 30, hourly: 15 },
};

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("booking-date").valueAsDate = new Date();
  document.getElementById("location-name").textContent = name;
  document.getElementById(
    "location-description"
  ).textContent = `Secure parking in ${name} with 24/7 surveillance and easy access.`;

  updateFare();
  hideSlideshow(); // Image slideshow disabled - was failing to render
  
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

function hideSlideshow() {
  const slideshowContainer = document.querySelector(".slideshow-container");
  const slideNav = document.getElementById("slide-nav");
  if (slideshowContainer) slideshowContainer.style.display = 'none';
  if (slideNav) slideNav.style.display = 'none';
}

function updateFare() {
  const vehicleType = document.getElementById("vehicle-type").value;
  const duration =
    parseInt(document.getElementById("booking-duration").value) || 1;
  const rates = pricing[vehicleType] || pricing["4W_Small"];
  const total = rates.base + rates.hourly * duration;

  document.getElementById("base-price").textContent = `₹${rates.base}`;
  document.getElementById(
    "hourly-rate"
  ).textContent = `₹${rates.hourly}/hr`;
  document.getElementById("fare-estimate").textContent = `₹${total}`;
  document.getElementById("total-fare").textContent = `₹${total}`;
}

function getDirections() {
  const details = { lat, lng, name, userLat, userLng };
  sessionStorage.setItem("parkingDetails", JSON.stringify(details));

  if (userLat && userLng) {
    window.location.href = `/HTML/dir.html?origin=${userLat},${userLng}&destination=${lat},${lng}`;
  } else {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        window.location.href = `/HTML/dir.html?origin=${lat},${lng}&destination=${lat},${lng}`;
      },
      () => alert("Location access needed for directions")
    );
  }
}

function processPayment() {
  const date = document.getElementById("booking-date").value;
  const time = document.getElementById("booking-hour").value;
  const vehicle = document.getElementById("vehicle-number").value;

  if (!date || !time || !vehicle) {
    alert("Please fill all fields");
    return false;
  }

  const fare =
    parseInt(
      document
        .getElementById("fare-estimate")
        .textContent.replace("₹", "")
    ) * 100;
  return {
    location: name,
    date,
    time,
    vehicle,
    fare,
    lat,
    lng,
    userLat,
    userLng,
  };
}

// Payment handler
document.getElementById("payNow").onclick = function (e) {
  e.preventDefault();
  const bookingData = processPayment();
  if (!bookingData) return;

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY,
    amount: bookingData.fare,
    currency: "INR",
    name: "Parking Reservation",
    description: "Payment for parking",
    handler: function (response) {
      sessionStorage.setItem(
        "paymentData",
        JSON.stringify({
          paymentId: response.razorpay_payment_id,
          vehicleNumber: bookingData.vehicle,
          bookingDate: bookingData.date,
          bookingTime: bookingData.time,
          amount: bookingData.fare / 100,
        })
      );
      window.location.href = "/HTML/confirm.html";
    },
    prefill: {
      name: "Customer",
      email: "customer@example.com",
      contact: "9999999999",
    },
    theme: { color: "#4285F4" },
  };

  new Razorpay(options).open();
};

function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), { mapId: "DEMO_MAP_ID",
    zoom: 15,
    center: { lat, lng },
    mapTypeId: "roadmap",
  });

  new google.maps.marker.AdvancedMarkerElement({
    position: { lat, lng },
    map: map,
    title: name,
  });

  if (userLat && userLng) {
    new google.maps.marker.AdvancedMarkerElement({
      position: { lat: parseFloat(userLat), lng: parseFloat(userLng) },
      map: map,
      title: "Your Location",
      content: (() => { const img = document.createElement('img'); img.src = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"; img.width = 40; img.height = 40; return img; })(),
    });

    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat, lng });
    bounds.extend({ lat: parseFloat(userLat), lng: parseFloat(userLng) });
    map.fitBounds(bounds);
  }
}

// Make functions global for onclick handlers
window.updateFare = updateFare;
window.getDirections = getDirections;
