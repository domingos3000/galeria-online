export default class AppError extends Error {

    public readonly statusCode: number;
    public readonly original_error: void;

    constructor(message: string, statusCode = 400, original_error?: void){
        super(message)
        this.statusCode = statusCode
        this.original_error = original_error
    }

}