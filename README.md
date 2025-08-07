# UrbonSpot - Parking Made Easy
```
├── HTML/                    # All HTML pages
│   ├── index.html          # Landing page
│   ├── home.html           # Home dashboard
│   ├── marker.html         # Parking spot details
│   ├── map.html            # Map view
│   ├── listspot.html       # List parking spot
│   ├── login.html          # User login
│   ├── register.html       # User registration
│   ├── dir.html            # Directions page
│   ├── confirm.html        # Booking confirmation
│   ├── contact-us.html     # Contact page
│   └── how-it-works.html   # How it works page
│
├── CSS/                    # Stylesheets
│   ├── marker.css          # Marker page styles (newly extracted)
│   ├── body.css            # Base body styles
│   ├── how-it-works.css    # How it works page styles
│   ├── listspot.css        # List spot page styles
│   ├── stylingDir.css      # Directions page styles
│   ├── stylinglogin.css    # Login/register page styles
│   ├── stylingMap.css      # Map page styles
│   └── stylingPayment.css  # Payment page styles
│
├── JS/                     # JavaScript files
│   ├── listspot.js         # List spot functionality
│   ├── photos.js           # Photo handling
│   ├── script.js           # General scripts
│   └── fare.js             # Fare calculation
│
├── Firebase/               # Firebase integration
│   ├── config.js           # Firebase configuration
│   ├── auth.js             # Authentication logic
│   ├── main.js             # Main Firebase script
│   ├── register.js         # Registration handling
│   └── service.js          # Firebase services
│
├── Map/                    # Map-related scripts
│   ├── location.js         # Location services
│   └── script.js           # Map functionality
│
├── Assets/                 # Static assets and data
│   ├── animation.json      # Lottie animations
│   ├── markerdata.json     # Map marker data
│   ├── settings.json       # App settings
│   └── firebase.json       # Firebase config
│
└── functions/              # Cloud Functions
    ├── index.js            # Main functions
    ├── handleRazorpayWebhook.js
    ├── package.json
    └── package-lock.json
── index.js            # Landing page scripts


### ✅ File Organization
- **HTML files** → `HTML/` folder
- **JavaScript files** → `JS/` folder  
- **JSON/Assets** → `Assets/` folder
- **CSS files** → `CSS/` folder (already organized)
- **Firebase code** → `Firebase/` folder (already organized)

## 🚀 Getting Started
- Open the `index.html` from main folder

## 📱 Features
- **Parking Spot Management** - List and find parking spots
- **Interactive Maps** - Google Maps integration
- **Booking System** - Reserve parking spots
- **Payment Integration** - Razorpay payment gateway
- **User Authentication** - Firebase auth
- **Responsive Design** - Mobile-first approach

## Environment Variables and Security

1. Copy `.env.example` to `.env` and fill in your Firebase credentials.
2. **Never commit your `.env` file or any secrets to git.**
3. The `.gitignore` already includes `.env` to prevent accidental commits.

Example:
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

If you have already committed secrets, rotate them immediately in your Firebase console.

## Securing API Keys in HTML

For HTML files (like map.html), do NOT hardcode API keys. Instead, inject them using a <script> block that sets window.FIREBASE_API_KEY and window.GOOGLE_MAPS_API_KEY. In production, use server-side injection or a build tool to set these values securely.

Example:
<script>
  window.FIREBASE_API_KEY = "YOUR_FIREBASE_API_KEY";
  window.GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";
</script>

Never commit real API keys to your repository.

## Razorpay API Key Security

- **Frontend:**
  - Do NOT hardcode your Razorpay public key in HTML or JS files.
  - Inject it using a <script> block that sets window.RAZORPAY_KEY_ID, just like other API keys.
  - Example:
    <script>
      window.RAZORPAY_KEY_ID = "YOUR_RAZORPAY_KEY_ID";
    </script>

- **Backend (Cloud Functions):**
  - Store your Razorpay secret using Firebase Functions config:
    firebase functions:config:set razorpay.webhook_secret="YOUR_SECRET"
  - Never commit your secret to the repository.
  - Deploy with: firebase deploy --only functions

---
