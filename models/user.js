const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            rquired:true,
            unique:true
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },
        password:{
            type:String,
            rquired:true
        },
        role:{
            type:String,
            enum:["head","manager","member"],
            required:true
        },
        parentId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            default:null
        },
        year: Number,
        department:String,
        credit:{
            type:Number,
            default:0
        },
        meetingsAttended:{
            type:Number,
            default:0
        },
        lastActivity:{
            type:Date,
            default:Date.now
        },
        createdAt:{
            type:Date,
            default:Date.now
        }
    }
);
module.exports=mongoose.model("User",userSchema)