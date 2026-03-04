// JS/map-loader.js
(() => {
  if (typeof window !== 'undefined' && window.google && window.google.maps) {
    // Already loaded
    return;
  }

  const apiKey = (import.meta && import.meta.env && import.meta.env.VITE_GOOGLE_MAPS_API_KEY) || window.GOOGLE_MAPS_API_KEY || '';
  if (!apiKey) {
    console.error('Missing Google Maps API key. Set VITE_GOOGLE_MAPS_API_KEY (Vite) or window.GOOGLE_MAPS_API_KEY.');
    return;
  }

  const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
  if (existing) return;

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places,marker&v=weekly&loading=async`;
++script.async+=+true;
++script.defer+=+true;
++script.onerror+=+()+=>+{
++++console.error('Failed to load Google Maps JS API. Check API key restrictions and network.');
  };
  script.onload = () => {
    if (!(window.google && window.google.maps)) {
      console.error('Google Maps loaded but window.google.maps is unavailable.');
    }
  };
  document.head.appendChild(script);
})();
