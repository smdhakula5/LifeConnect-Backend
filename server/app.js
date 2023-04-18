import latAndLong from "../schemas/LatAndLongObject.js";
import UserSchema from "../schemas/UserSchema.js";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import { Db } from "mongodb";
import cors from "cors";

const app = express();
// const UserSchema = require('../schemas/UserSchema');
// const latAndLong = require('../schemas/LatAndLongObject');
app.use(bodyParser.json());
app.use(cors());
  
mongoose.connect("mongodb://localhost:27017/LifeConnect");
const User = mongoose.model("User",UserSchema);


app.listen(3000,()=>{
    console.log("Server up and running on port 3000");
});

app.get('/',(req,res)=>{
    res.send("Hello");
});

app.post('/',(req,res)=>{
    var a = req.body.username;
    var b = req.body.password;
    User.find({userName:a}).exec().then(users=>{
        if(users.length==0){
            res.send({status:false});
        }
        if(users[0].password===b){
            res.send({status:true});
        }
        else{
            res.send({status:false});
        }
    }).catch(err=>{
        console.log(err);
    });
    // res.send({status:false});
});

// const coords = new latAndLong("17.4301° N","78.5416° E");
// const obj = new User({name:"Keyur",bloodGroup:"A+ve",permanentAddress:coords,phoneNumber:"987654321",userName:"Keyur12",password:"gadwalchittibabu"});
