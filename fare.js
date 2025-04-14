/**
 * Parking Fare Calculation Module
 * Handles all pricing logic for parking reservations
 */

// Pricing constants (in rupees)
const BASE_PRICE = 50;          // Base price for any parking duration
const HOURLY_RATE = 10;         // Additional cost per hour
const OVERTIME_RATE = 25;       // Rate per 15 minutes of overtime

/**
 * Calculates the standard fare based on booked duration
 * @param {number} hours - Number of hours booked
 * @returns {number} - Total standard fare
 */
function calculateStandardFare(hours) {
    return BASE_PRICE + (hours * HOURLY_RATE);
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
 * @returns {object} - Complete fare breakdown
 */
function calculateTotalFare(startTime, bookedHours, actualEndTime) {
    const scheduledEnd = new Date(startTime.getTime() + (bookedHours * 60 * 60 * 1000));
    const standardFare = calculateStandardFare(bookedHours);
    const overtime = calculateOvertime(scheduledEnd, actualEndTime);
    
    return {
        standardFare: standardFare,
        overtimeCharges: overtime.charges,
        totalAmount: standardFare + overtime.charges,
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
 */
function updateFareEstimate() {
    const duration = parseInt(document.getElementById('booking-duration').value) || 1;
    const estimatedFare = calculateStandardFare(duration);
    
    // Update main fare display
    if (document.getElementById('fare-estimate')) {
        document.getElementById('fare-estimate').textContent = `₹${estimatedFare}`;
    }
    
    // Update breakdown total
    if (document.getElementById('total-fare-estimate')) {
        document.getElementById('total-fare-estimate').textContent = `₹${estimatedFare}`;
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
        OVERTIME_RATE
    }
};
