/* eslint-disable @typescript-eslint/no-unused-vars */


class AppError extends Error {
    public statusCode:number;

    constructor(statusCode:number, message:string, stack?:string){
        super(message);
        this.statusCode = statusCode;
        if (stack) {
            this.stack = stack;
        }
    }
}