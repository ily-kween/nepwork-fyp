class ApiResponse {
    constructor(
        statusCode = 500,
        success = false,
        isAuthenticated = false,
        message = "",
        data = null,
    ) {
        this.statusCode = statusCode;
        this.success = success;
        this.isAuthenticated = isAuthenticated;
        this.message = message;
        this.data = data;
    }
}

export default ApiResponse;
