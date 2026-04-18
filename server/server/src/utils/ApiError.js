class ApiError extends Error {
    constructor(statusCode, isAuthenticated, message) {
        super(message);

        this.statusCode = statusCode || 500;
        this.success = false;
        this.isAuthenticated = isAuthenticated || false;
        this.message = message;
    }

    toJSON() {
        return {
            statusCode: this.statusCode,
            success: this.success,
            isAuthenticated: this.isAuthenticated,
            message: this.message,
        };
    }
}

export default ApiError;

export const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        res.status(err.statusCode).json(err.toJSON());
    } else {
        res.status(500).json({
            statusCode: 500,
            success: false,
            isAuthenticated: false,
            message: "SERVER ERROR!!...." + err.message + "....SERVER ERROR!!",
        });
    }
    return next();
};
