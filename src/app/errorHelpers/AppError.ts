class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(statusCode: number, message: string, stack?: string) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { AppError };
