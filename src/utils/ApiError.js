//this file comtins the all errors that can be there in api

class ApiError extends Error{
    constructor(
        statusCode,
        messsage="Something went worng",
        errors=[],
        stack=""
    ){
        //overwring the errors
        super(messsage)
        this.statusCode=statusCode
        this.data = null
        this.message = messsage
        this.success = false;
        this.errors = errors
if (stack) {
    this.stack = stack
}
else{
    Error.captureStackTrace(this,this.constructor)
}
    }
}
export {ApiError}