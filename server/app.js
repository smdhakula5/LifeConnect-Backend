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
const User = mongoose.model("User", UserSchema);


app.listen(3000, () => {
    console.log("Server up and running on port 3000");
});

app.get('/', (req, res) => {
    res.send("Hello");
});

app.post('/login', async(req, res) => {
    var a = req.body.username;
    var b = req.body.password;
    await User.find({ userName: a }).exec().then(users => {
        if (users.length == 0) {
            return res.send({ status: false });
        }
        if (users[0].password === b) {
            return res.send({ status: true, donor: req.body.bloodGroup != null });
        }
        else {
            return res.send({ status: false });
        }
    }).catch(err => {
        console.log(err);
    });
    // res.send({status:false});
});

// const coords = new latAndLong("17.4301° N","78.5416° E");
// const obj = new User({name:"Keyur",bloodGroup:"A+ve",permanentAddress:coords,phoneNumber:"987654321",userName:"Keyur12",password:"gadwalchittibabu"});

/*

name
bloodGroup
permanentAddress
phoneNumber
userName
password

*/


// API for signup
app.post("/signup", async(req, res) => {

    // If request is null, send bad request
    if (req.body === null) {
        console.error("Request body is null while signing up");
        return res.status(400).send({ "status": false, "message": "Request body is null while signing up!" });
    }

    // Checking if user is already present
    const existingData = await User.find({userName:req.body.userName}).exec().then((existingData) => {
        if(existingData!=null && existingData.length!=0)
        {
            console.error(`User already exists with username as ${req.body.userName}`);
            return res.status(403).send({"status":false,"message":"User Already Exists!"});
        }
    });
    

    // After all the guards, creating a new user
    await User.create(req.body).then((data) => {

        res.status(201).send({
            "status": true,
            "userName": req.body.userName,
            "userType": (req.body.bloodGroup != null ? "donor" : "receiver")
        })
    }).catch((err) => {
        console.error(`Error in signing up for user with userName ${req.body.userName}`);
        res.status(500).send(`Unable to create a new user for username as ${req.body.userName}`);
    })
})

// API to fetch user profile for a specific user
app.get("/profile/:userName",async(req,res) => {
    const userName = req.params.userName;

    await User.find({userName:userName}).exec().then((data) => {
        if(data!=null)
        {   
            console.log(`Fetched information for user profile for user with username ${userName}`);
            res.send(data[0]);
        }
    }).catch((err) => {
        console.error(`Unable to get user profile information for user with username ${userName}`);
        res.status(404).send()
    })
})