# UrbonSpot - Parking Management System

## 📁 Project Structure

```
urbonspotweb/
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
│   ├── index.js            # Landing page scripts
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
```

## 🎯 Key Improvements Made

### ✅ Code Optimization
- **Reduced marker.html from 1023 to 292 lines** (71% reduction)
- Extracted CSS to separate `marker.css` file
- Removed redundant decorative elements
- Streamlined JavaScript functions
- Consolidated styling variables

### ✅ File Organization
- **HTML files** → `HTML/` folder
- **JavaScript files** → `JS/` folder  
- **JSON/Assets** → `Assets/` folder
- **CSS files** → `CSS/` folder (already organized)
- **Firebase code** → `Firebase/` folder (already organized)

### ✅ Path Updates
All file references have been updated for the new structure:
- CSS references: `href="../CSS/filename.css"`
- JS references: `src="../JS/filename.js"`
- Firebase references: `src="../Firebase/filename.js"`
- HTML cross-references remain relative within the HTML/ folder

## 🚀 Getting Started

1. Open any HTML file from the `HTML/` folder
2. Main entry points:
   - `HTML/index.html` - Landing page
   - `HTML/home.html` - Main dashboard
   - `HTML/map.html` - Interactive map

## 🔧 Development

- All styling is now modular and organized
- Firebase configuration is centralized
- JavaScript modules are properly separated
- Assets are organized in dedicated folder

## 📱 Features

- **Parking Spot Management** - List and find parking spots
- **Interactive Maps** - Google Maps integration
- **Booking System** - Reserve parking spots
- **Payment Integration** - Razorpay payment gateway
- **User Authentication** - Firebase auth
- **Responsive Design** - Mobile-first approach

---

*Project structure optimized for maintainability and scalability.* 