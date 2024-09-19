//require('dotenv').config({path:'./env'})
import dotenv from "dotenv" 
import connectDB from "./db/index.js";
dotenv.config({
    path: './env'
})


connectDB()
 






















































  /* FIRST APPROACH
  import express from "express";
  const app = express()
(async ()=>{ 
    try{
        await mongoose.connect('${process.nv.MONGODB_URL}/${DB_NAME}')
        app.on("error",()=>
        {
            console.log("ERRR".error);
            throw error
        })
          app.listen(process.env.PORT,()=>{
            console.log('App is listening on port ${process.env.PORT}');
          })
    }
    catch(error){ 
        console.error("ERROR",error)
        throw err
    }
    
    
})
()*/