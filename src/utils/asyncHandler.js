//promise method
const asyncHandler = (requestHandler)=> {
   return  (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=> next(err))
    }

}
export{asyncHandler}


// this is try catch code
//note asynchandler is a hgher ordeer function which accepts function as parameter and can also return the function as varible 
/*const asyncHandler = (fn)=> async(req,re,next)=>{
    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(err.code||500).json({
            success:false,
            message:err.message
        })
        
    }
}
*/


