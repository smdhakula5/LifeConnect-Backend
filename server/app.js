import latAndLong from "../schemas/LatAndLongObject.js";
import UserSchema from "../schemas/UserSchema.js";
import ReceiverSchema from "../schemas/ReceiverSchema.js";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import { Db } from "mongodb";
import cors from "cors";

const MINIMUM = 5;

const app = express();
app.use(bodyParser.json());
app.use(cors());
mongoose.connect("mongodb://localhost:27017/LifeConnect");
const User = mongoose.model("User", UserSchema);
const Receiver = mongoose.model("Receiver",ReceiverSchema);


app.listen(3000,'0.0.0.0',() => {
    console.log("Server up and running on port 3000");
});

app.get('/', (req, res) => {
    res.send("Hello");
});

app.post('/users/login', async (req, res) => {
    const userName = req.body.username;
    const password = req.body.password;
    console.log(req.body);
    await User.find({ userName: userName }).exec().then(users => {
        if (users.length == 0) {
            res.send({ status: false ,message:"User doesn't exist"});
        }
        if (users[0].password === password) {
            res.send({ status: true,userType:users[0].bloodGroup!=null?"donor":"receiver",message:"Success"});
        }
        else {
            res.send({ status: false ,message:"Password not matched"});
        }
    }).catch(err => {
        console.log(err);
    });
    
});


app.post("/users/signup", async (req, res) => {
    const { name, phoneNumber, permanentAddress, userName, password, bloodGroup } = req.body;
    
    // If any required fields are missing, send a bad request response
    if (!name || !phoneNumber || !permanentAddress || !userName || !password) {
        console.error("Request body is missing required fields while signing up");
        return res.status(400).send({ "status": false, "message": "Request body is missing required fields while signing up!" });
    }

    // Checking if user is already present
    const existingUser = await User.findOne({ userName: userName }).exec();
    if (existingUser) {
        console.error(`User already exists with username as ${userName}`);
        return res.status(403).send({ "status": false, "message": "User Already Exists!" });
    }

    // After all the guards, creating a new user
    const newUser = {
        name,
        phoneNumber,
        permanentAddress,
        userName,
        password,
    };
    
    if (bloodGroup) {
        newUser.bloodGroup = bloodGroup;
    }
    
    const userType = bloodGroup ? "donor" : "receiver";
    
    await User.create(newUser).then((data) => {
        console.log(`Saving details in DB for user with user name ${userName}`)
        res.status(201).send({
            "status": true,
            "userName": userName,
            "userType": userType,
        })
    }).catch((err) => {
        console.error(`Error in signing up for user with userName ${userName}`);
        res.status(500).send(`Unable to create a new user for username as ${userName}`);
    })

})


// Update count of blood types
app.put("/users/:userName/update",async(req,res) => {
    const userName = req.params.userName;

    await Receiver.findOneAndUpdate({userName:userName},{$inc:req.body}).exec().then((data) => {
        console.log(`Updating details for receiver in DB with user name ${userName}`);
        if(!data.length)
        {
            console.error(`No details are present in receiver model for user name ${userName}`);
            res.status(404).send(`No details are present in receiver model for user name ${userName}`);
        }


        res.status(201).send(``)

    
    }).catch((err) => {
        console.error(`Error in updating blood type count for users with user name ${userName}`);
        res.status(500).send("Internal Server Error! Unable to ")
    })
})


// API to fetch user profile for a specific user
app.get("/users/:userName", async (req, res) => {
    const userName = req.params.userName;

    await User.find({ userName: userName }).exec().then((data) => {
        if (data == null || data.length == 0) {
            console.log(`User not found with username ${userName}`);
            res.status(404).send(`User not found with username ${userName}`);
        }
        console.log(`Fetched information for user profile for user with username ${userName}`);
        res.send(data[0]);
    }).catch((err) => {
        console.error(`Unable to get user profile information from DB for user with username ${userName}`);
        res.status(500).send(`Unable to make DB call to fetch user details with username ${userName}`);
    })
})


// API to check existing quantities and send alerts. Currently incomplete.

app.post("/users/:userName/check", async (req, res) => {

    const userName = req.params.userName;

    await Receiver.find({ userName: userName }).exec().then((data) => {
        if (data === null || data.length == 0) {
            console.log(`User not found with username ${userName}`);
            res.status(404).send(`User with username ${userName} Not found to check quantities`);
        }

        const responseFromDB = data[0];

        let requiredBloodGroups = [];
        responseFromDB.bloodGroups.forEach((value) => {
            if(value.count<MINIMUM)
            {
                requiredBloodGroups.add(value);
            }
        });

        if(requiredBloodGroups.length == 0)
        {

            res.send("All the blood groups are sufficient");
        }
        
        // TODO GENERATE ALERTS FUNCTIONALITY

        // LANGA CODE. SHOULD BE OPTIMIZED BY MAINTAING ONLY ONE SCHEMA FOR EVERTHING.

        

    }).catch((err) => {
        console.error(`Could not connect to DB to check quantites for user with username ${userName}`);
        res.status(500).send(`Could not connect to DB to check quantites for user with username ${userName}`);
    })



});

