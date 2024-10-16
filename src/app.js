import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app= express()

// all configuratons and its settings
app.use(cors({
   origin: process.env.CORS_ORIGIN ,
credentials:true
}))
//to limit on json data
//to deal with url data
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.json({limit:"16kb"}))

app.use(express.static("public"))
//for cookie parser
app.use(cookieParser());

// routes import
import userRouter from './routes/user.route.js'

//routes declaration

app.use("/api/v1/users",userRouter)
// app.get('/', (req, res) => {
//    res.send('POST request to the homepage')
// })
//http://localhost:8000/api/v1/users/register
export {app}