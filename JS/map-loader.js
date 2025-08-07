// JS/map-loader.js
const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
script.async = true;
script.defer = true;
document.head.appendChild(script);
