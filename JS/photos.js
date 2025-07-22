document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const placeId = urlParams.get("placeId");
  const lat = parseFloat(urlParams.get("lat"));
  const lng = parseFloat(urlParams.get("lng"));

  if (placeId) {
    fetchGoogleMapsPhotos(placeId);
  } else if (lat && lng) {
    findPlaceByLocation(lat, lng);
  }
});

function fetchGoogleMapsPhotos(placeId) {
  const service = new google.maps.places.PlacesService(
    document.createElement("div")
  );

  service.getDetails({ placeId: placeId }, (place, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && place.photos) {
      initSlideshow(place.photos);
    } else {
      showDefaultImage();
    }
  });
}

function findPlaceByLocation(lat, lng) {
  const service = new google.maps.places.PlacesService(
    document.createElement("div")
  );
  const request = {
    location: new google.maps.LatLng(lat, lng),
    radius: 50,
    query: "parking",
  };

  service.textSearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && results[0]) {
      fetchGoogleMapsPhotos(results[0].place_id);
    } else {
      showDefaultImage();
    }
  });
}

function initSlideshow(photos) {
  const slideshow = document.getElementById("slideshow");
  const slideNav = document.getElementById("slide-nav");

  // Clear existing content
  slideshow.innerHTML = "";
  slideNav.innerHTML = "";

  // Add photos to slideshow
  photos.slice(0, 5).forEach((photo, index) => {
    const slide = document.createElement("img");
    slide.src = photo.getUrl({ maxWidth: 800 });
    slide.className = "slide" + (index === 0 ? " active" : "");
    slide.alt = "Parking spot photo";
    slideshow.appendChild(slide);

    const dot = document.createElement("div");
    dot.className = "slide-dot" + (index === 0 ? " active" : "");
    dot.dataset.index = index;
    dot.addEventListener("click", () => showSlide(index));
    slideNav.appendChild(dot);
  });

  // Set up navigation controls
  document.querySelector(".prev-btn").addEventListener("click", showPrevSlide);
  document.querySelector(".next-btn").addEventListener("click", showNextSlide);

  // Auto-advance slides
  let slideInterval = setInterval(showNextSlide, 5000);

  // Pause on hover
  slideshow.parentElement.addEventListener("mouseenter", () =>
    clearInterval(slideInterval)
  );
  slideshow.parentElement.addEventListener("mouseleave", () => {
    slideInterval = setInterval(showNextSlide, 5000);
  });
}

function showDefaultImage() {
  const slideshow = document.getElementById("slideshow");
  slideshow.innerHTML = `
        <img src="https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${lat},${lng}&fov=90&key=AIzaSyAlUjF8he099BRUCD-B5_6QGuyRDUNESFY" 
             class="slide active" 
             alt="Parking spot street view">
    `;
}

function showSlide(index) {
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".slide-dot");

  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });
}

function showNextSlide() {
  const slides = document.querySelectorAll(".slide");
  const currentIndex = Array.from(slides).findIndex((slide) =>
    slide.classList.contains("active")
  );
  const nextIndex = (currentIndex + 1) % slides.length;
  showSlide(nextIndex);
}

function showPrevSlide() {
  const slides = document.querySelectorAll(".slide");
  const currentIndex = Array.from(slides).findIndex((slide) =>
    slide.classList.contains("active")
  );
  const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
  showSlide(prevIndex);
}
