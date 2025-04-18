/**
 * Parking Fare Calculation Module
 * Handles all pricing logic for parking reservations
 */

// Pricing constants (in rupees)
const BASE_PRICE = 50;          // Base price for any parking duration
const HOURLY_RATE = 10;         // Additional cost per hour
const OVERTIME_RATE = 25;       // Rate per 15 minutes of overtime

// Vehicle type pricing (from main.html)
const VEHICLE_RATES = {
    "2W": {
        base: 10,
        hourly: { min: 20, max: 50 },
        weekly: { min: 300, max: 500 }
    },
    "4W_Small": {
        base: 20,
        hourly: { min: 30, max: 80 },
        weekly: { min: 500, max: 800 }
    },
    "4W_SUV": {
        base: 20,
        hourly: { min: 30, max: 80 },
        weekly: { min: 700, max: 1000 }
    }
};

/**
 * Calculates the standard fare based on booked duration
 * @param {number} hours - Number of hours booked
 * @param {string} [vehicleType="4W_Small"] - Vehicle type (2W, 4W_Small, 4W_SUV)
 * @param {string} [durationType="hourly"] - Duration type (hourly, weekly)
 * @returns {object} - Returns min and max fare estimates
 */
function calculateStandardFare(hours, vehicleType = "4W_Small", durationType = "hourly") {
    if (!VEHICLE_RATES[vehicleType]) {
        vehicleType = "4W_Small"; // Default to small car if invalid type
    }

    const rates = VEHICLE_RATES[vehicleType];
    const rateType = durationType === "hourly" ? "hourly" : "weekly";
    
    return {
        min: rates.base + (rates[rateType].min * hours),
        max: rates.base + (rates[rateType].max * hours),
        base: rates.base,
        rateMin: rates[rateType].min,
        rateMax: rates[rateType].max,
        duration: hours,
        durationType: durationType
    };
}

/**
 * Calculates overtime charges when user exceeds booked time
 * @param {Date} scheduledEnd - When the booking was scheduled to end
 * @param {Date} actualEnd - When the user actually left
 * @returns {object} - Overtime details including charges and minutes
 */
function calculateOvertime(scheduledEnd, actualEnd) {
    // If user left on time or early, no overtime charge
    if (actualEnd <= scheduledEnd) {
        return { charges: 0, minutes: 0, blocks: 0 };
    }
    
    // Calculate overtime in milliseconds
    const overtimeMs = actualEnd - scheduledEnd;
    
    // Convert to minutes
    const overtimeMinutes = Math.ceil(overtimeMs / (60 * 1000));
    
    // Calculate 15-minute blocks (rounded up)
    const blocks = Math.ceil(overtimeMinutes / 15);
    
    return {
        charges: blocks * OVERTIME_RATE,
        minutes: overtimeMinutes,
        blocks: blocks
    };
}

/**
 * Calculates total parking fare including any overtime
 * @param {Date} startTime - Booking start time
 * @param {number} bookedHours - Duration booked in hours
 * @param {Date} actualEndTime - When the user actually left
 * @param {string} [vehicleType] - Vehicle type
 * @param {string} [durationType] - Duration type
 * @returns {object} - Complete fare breakdown
 */
function calculateTotalFare(startTime, bookedHours, actualEndTime, vehicleType, durationType) {
    const scheduledEnd = new Date(startTime.getTime() + (bookedHours * 60 * 60 * 1000));
    const standardFare = vehicleType ? 
        calculateStandardFare(bookedHours, vehicleType, durationType) : 
        BASE_PRICE + (bookedHours * HOURLY_RATE);
    const overtime = calculateOvertime(scheduledEnd, actualEndTime);
    
    return {
        standardFare: standardFare,
        overtimeCharges: overtime.charges,
        totalAmount: (typeof standardFare === 'object' ? standardFare.max : standardFare) + overtime.charges,
        bookingDetails: {
            startTime: startTime,
            scheduledEndTime: scheduledEnd,
            actualEndTime: actualEndTime,
            bookedHours: bookedHours,
            overtimeMinutes: overtime.minutes
        }
    };
}

/**
 * Updates fare estimate on UI when duration changes
 * @param {string} [vehicleType] - Vehicle type (optional)
 * @param {string} [durationType] - Duration type (optional)
 */
function updateFareEstimate(vehicleType, durationType) {
    const duration = parseInt(document.getElementById('booking-duration').value) || 1;
    let fareInfo;
    
    if (vehicleType && durationType) {
        // Use the vehicle-specific calculation
        fareInfo = calculateStandardFare(duration, vehicleType, durationType);
        
        // Update main fare display
        if (document.getElementById('fare-estimate')) {
            document.getElementById('fare-estimate').textContent = 
                `₹${fareInfo.min} - ₹${fareInfo.max}`;
        }
        
        // Update breakdown total
        if (document.getElementById('total-fare-estimate')) {
            document.getElementById('total-fare-estimate').textContent = 
                `₹${fareInfo.min} - ₹${fareInfo.max}`;
        }
    } else {
        // Use the simple calculation
        const estimatedFare = BASE_PRICE + (HOURLY_RATE * duration);
        
        // Update main fare display
        if (document.getElementById('fare-estimate')) {
            document.getElementById('fare-estimate').textContent = `₹${estimatedFare}`;
        }
        
        // Update breakdown total
        if (document.getElementById('total-fare-estimate')) {
            document.getElementById('total-fare-estimate').textContent = `₹${estimatedFare}`;
        }
    }
}

// Expose necessary functions to global scope
window.parkingFare = {
    calculateStandardFare,
    calculateOvertime,
    calculateTotalFare,
    updateFareEstimate,
    rates: {
        BASE_PRICE,
        HOURLY_RATE,
        OVERTIME_RATE,
        VEHICLE_RATES
    }
};