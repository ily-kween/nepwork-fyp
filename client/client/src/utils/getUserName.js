/**
 * Safely extract user name from user object
 * Handles both direct properties (firstName, lastName) and nested properties (name.firstName, name.lastName)
 * 
 * @param {Object} user - User object
 * @param {boolean} fullName - If true, returns "firstName lastName", if false returns just firstName
 * @returns {String} User name or "Unknown"
 */
export function getUserName(user, fullName = true) {
    if (!user) return "Unknown";

    // Try direct properties first
    const firstName = user.firstName || user.name?.firstName || "";
    const lastName = user.lastName || user.name?.lastName || "";

    if (!firstName && !lastName) return "Unknown";

    if (fullName) {
        return `${firstName} ${lastName}`.trim();
    }
    return firstName.trim() || "Unknown";
}

/**
 * Get first name from user object
 * @param {Object} user - User object
 * @returns {String} First name or "Unknown"
 */
export function getFirstName(user) {
    if (!user) return "Unknown";
    return user.firstName || user.name?.firstName || "Unknown";
}

/**
 * Get last name from user object
 * @param {Object} user - User object
 * @returns {String} Last name or "Unknown"
 */
export function getLastName(user) {
    if (!user) return "Unknown";
    return user.lastName || user.name?.lastName || "Unknown";
}
