import mongoose ,{Schema} from  "mongoose"
const subscriptionSchema  = new Schema({

subscriber:{
    type:Schema.Types.ObjectId,// one is subscribing
    ref:"User"
},
channel:{
     type:Schema.Types.ObjectId,// one whhose channel gets subscribed by" subscriber"
    ref:"User"
}


},{timestamps:true})
export const Subscription = mongoose.model("Subscription",subscriptionSchema)
