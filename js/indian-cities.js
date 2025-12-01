/**
 * Indian Cities Coordinates
 * Used for mapping and location-based features
 * Coordinates: [Latitude, Longitude]
 */

const indianCities = {
    // Major Metropolitan Areas
    'Delhi': { lat: 28.7041, lng: 77.1025, state: 'Delhi', region: 'North' },
    'Mumbai': { lat: 19.0760, lng: 72.8777, state: 'Maharashtra', region: 'West' },
    'Bangalore': { lat: 12.9716, lng: 77.5946, state: 'Karnataka', region: 'South' },
    'Hyderabad': { lat: 17.3850, lng: 78.4867, state: 'Telangana', region: 'South' },
    'Chennai': { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu', region: 'South' },
    'Kolkata': { lat: 22.5726, lng: 88.3639, state: 'West Bengal', region: 'East' },
    'Pune': { lat: 18.5204, lng: 73.8567, state: 'Maharashtra', region: 'West' },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714, state: 'Gujarat', region: 'West' },
    
    // Northern Cities
    'Jaipur': { lat: 26.9124, lng: 75.7873, state: 'Rajasthan', region: 'North' },
    'Lucknow': { lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh', region: 'North' },
    'Chandigarh': { lat: 30.7333, lng: 76.7794, state: 'Chandigarh', region: 'North' },
    'Indore': { lat: 22.7196, lng: 75.8577, state: 'Madhya Pradesh', region: 'Central' },
    'Bhopal': { lat: 23.1815, lng: 79.9864, state: 'Madhya Pradesh', region: 'Central' },
    'Gwalior': { lat: 26.2183, lng: 78.1629, state: 'Madhya Pradesh', region: 'Central' },
    'Khargone': { lat: 21.7051, lng: 75.4361, state: 'Madhya Pradesh', region: 'Central' },
    
    // Western Cities
    'Surat': { lat: 21.1702, lng: 72.8311, state: 'Gujarat', region: 'West' },
    'Nagpur': { lat: 21.1458, lng: 79.0882, state: 'Maharashtra', region: 'Central' },
    'Vadodara': { lat: 22.3072, lng: 73.1812, state: 'Gujarat', region: 'West' },
    
    // Eastern Cities
    'Ranchi': { lat: 23.3441, lng: 85.3096, state: 'Jharkhand', region: 'East' },
    'Patna': { lat: 25.5941, lng: 85.1376, state: 'Bihar', region: 'East' },
    'Guwahati': { lat: 26.1445, lng: 91.7362, state: 'Assam', region: 'NorthEast' },
    
    // Southern Cities
    'Kochi': { lat: 9.9312, lng: 76.2673, state: 'Kerala', region: 'South' },
    'Visakhapatnam': { lat: 17.6869, lng: 83.2185, state: 'Andhra Pradesh', region: 'South' },
    'Coimbatore': { lat: 11.0081, lng: 76.9957, state: 'Tamil Nadu', region: 'South' },
    
    // India Center (Default)
    'India': { lat: 20.5937, lng: 78.9629, state: 'India', region: 'Center' },
};

/**
 * Get coordinates for a city
 * @param {string} cityName - Name of the city
 * @returns {object} - {lat, lng} or India center if not found
 */
function getCityCoordinates(cityName) {
    if (!cityName) return indianCities['India'];
    
    const normalizedCity = cityName
        .trim()
        .split(',')[0] // Handle "City, State" format
        .trim();
    
    // Try exact match
    if (indianCities[normalizedCity]) {
        return indianCities[normalizedCity];
    }
    
    // Try case-insensitive match
    for (const city in indianCities) {
        if (city.toLowerCase() === normalizedCity.toLowerCase()) {
            return indianCities[city];
        }
    }
    
    // Try partial match
    for (const city in indianCities) {
        if (city.toLowerCase().includes(normalizedCity.toLowerCase()) ||
            normalizedCity.toLowerCase().includes(city.toLowerCase())) {
            return indianCities[city];
        }
    }
    
    // Default to India center
    return indianCities['India'];
}

/**
 * Get coordinates from location string
 * Supports: "City", "City, State", or existing coordinates
 * @param {string} locationString - Location description
 * @returns {object} - {lat, lng}
 */
function getCoordinatesFromLocation(locationString) {
    if (!locationString) {
        return indianCities['India'];
    }
    
    // Extract city name (first part before comma)
    const cityPart = locationString.split(',')[0].trim();
    return getCityCoordinates(cityPart);
}

/**
 * Map coordinates from location name
 * Automatically detect if it's an Indian location
 * @param {string} location - Location name or description
 * @returns {object} - {lat, lng, isIndian: boolean}
 */
function mapLocationToCoordinates(location) {
    const coords = getCoordinatesFromLocation(location);
    return {
        lat: coords.lat,
        lng: coords.lng,
        state: coords.state || 'Unknown',
        region: coords.region || 'Unknown',
        isIndian: true,
        city: location.split(',')[0].trim()
    };
}

/**
 * Get all Indian states
 * @returns {array} - Array of state names
 */
function getIndianStates() {
    const states = new Set();
    for (const city in indianCities) {
        if (indianCities[city].state !== 'India') {
            states.add(indianCities[city].state);
        }
    }
    return Array.from(states).sort();
}

/**
 * Get cities in a specific region
 * @param {string} region - Region name (North, South, East, West, Central, NorthEast)
 * @returns {array} - Array of city objects in that region
 */
function getCitiesByRegion(region) {
    const cities = [];
    for (const city in indianCities) {
        if (indianCities[city].region === region) {
            cities.push({
                name: city,
                ...indianCities[city]
            });
        }
    }
    return cities;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1, lng1 - First coordinate
 * @param {number} lat2, lng2 - Second coordinate
 * @returns {number} - Distance in kilometers
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        indianCities,
        getCityCoordinates,
        getCoordinatesFromLocation,
        mapLocationToCoordinates,
        getIndianStates,
        getCitiesByRegion,
        calculateDistance
    };
}
