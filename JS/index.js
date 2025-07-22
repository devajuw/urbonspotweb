// Fare Calculation with range estimates
function calculateFare() {
  const vehicleType = document.getElementById("vehicleType").value;
  const durationType = document.querySelector(
    'input[name="duration"]:checked'
  ).value;
  const duration = parseInt(document.getElementById("durationInput").value);

  if (!duration || duration < 1) {
    document.getElementById("fareResult").innerText =
      "Please enter a valid number.";
    return;
  }

  let base = 0,
    minRate = 0,
    maxRate = 0;

  if (vehicleType === "2W") {
    base = 10;
    if (durationType === "hourly") {
      minRate = 20;
      maxRate = 50;
    } else {
      minRate = 300;
      maxRate = 500;
    }
  } else if (vehicleType === "4W_Small") {
    base = 20;
    if (durationType === "hourly") {
      minRate = 30;
      maxRate = 80;
    } else {
      minRate = 500;
      maxRate = 800;
    }
  } else if (vehicleType === "4W_SUV") {
    base = 20;
    if (durationType === "hourly") {
      minRate = 30;
      maxRate = 80;
    } else {
      minRate = 700;
      maxRate = 1000;
    }
  }

  const minTotal = base + minRate * duration;
  const maxTotal = base + maxRate * duration;

  document.getElementById("fareResult").innerHTML = `
    Estimated Fare: ₹${minTotal} - ₹${maxTotal}<br>
    <span class="text-sm font-normal">(Base: ₹${base} + ${duration} ${
    durationType === "hourly" ? "hour(s)" : "week(s)"
  } × ₹${minRate}-${maxRate})</span>
  `;
}

// Toggle Fare Chart
function toggleFareChart() {
  const chart = document.getElementById("fareChart");
  chart.style.display = chart.style.display === "none" ? "block" : "none";
}

// Import Firebase libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5rM-Z_YxL6mpPb5qX3S7A-ykBshAA_Ro",
  authDomain: "dev-85f8d.firebaseapp.com",
  projectId: "dev-85f8d",
  storageBucket: "dev-85f8d.firebasestorage.app",
  messagingSenderId: "884673937857",
  appId: "1:884673937857:web:97943fdefae91ccfe36f40",
  measurementId: "G-4CR2VG9QTK",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

//LOGIN HANDLER

window.addEventListener("load", async () => {
  const profileDiv = document.getElementById("profile");
  const profilePic = document.getElementById("profilePic");
  const profileName = document.getElementById("profileName"); // Add this element in your HTML
  const logoutBtn = document.getElementById("logoutBtn");
  const loginContainer = document.getElementById("loginContainer");
  const loginBtn = document.getElementById("loginBtn");

  // Check if user is logged in
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user && user.uid) {
      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        profilePic.src = userData.photoURL || "default-profile.png";
        profileName.innerText = userData.name || "User";
        profileDiv.style.display = "block"; // Ensure profileDiv is visible
        loginContainer.style.display = "none"; // Hide login button
      } else {
        console.error("No such user in Firestore!");
        profileDiv.style.display = "none"; // Hide profileDiv
        loginContainer.style.display = "block"; // Show login button
      }
    } else {
      // No user logged in - show login button
      profileDiv.classList.add("hidden");
      loginContainer.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    // Show login button as fallback on error
    profileDiv.classList.add("hidden");
    loginContainer.classList.remove("hidden");
  }

  // Add event listeners
  loginBtn.addEventListener("click", () => {
    window.location.replace("login.html"); // Use replace to ensure immediate redirection
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    // After logout, show login button and hide profile
    profileDiv.classList.add("hidden");
    loginContainer.classList.remove("hidden");
  });
});
