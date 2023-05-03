import latAndLong from "../schemas/LatAndLongObject.js";
import UserSchema from "../schemas/UserSchema.js";
import ReceiverSchema from "../schemas/ReceiverSchema.js";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import { Db } from "mongodb";
import cors from "cors";

const MINIMUM = 5;
const DISTANCE = 10;

const app = express();
app.use(bodyParser.json());
app.use(cors());
mongoose.connect("mongodb://localhost:27017/LifeConnect");
const User = mongoose.model("User", UserSchema);
const Receiver = mongoose.model("Receiver",ReceiverSchema);

async function geocodeAddress(address, apiKey) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    const {lat, lng} = data.results[0].geometry.location;
    return {lat, lng};
}


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
    const { name, phoneNumber, location, userName, password, bloodGroup } = req.body;

    console.log(req.body);
    
    // If any required fields are missing, send a bad request response
    if (!name || !phoneNumber || !location || !userName || !password) {
        console.error("Request body is missing required fields while signing up");
        return res.status(400).send({ "status": false, "message": "Request body is missing required fields while signing up!" });
    }

    // Checking if user is already present
    const existingUser = await User.findOne({ userName: userName }).exec();
    if (existingUser) {
        console.error(`User already exists with username as ${userName}`);
        return res.status(403).send({ "status": false, "message": "User Already Exists!" });
    }

    const address = location;
    const apiKey = 'AIzaSyD_TW6eYj_vZurwo78v3L0c-VP2Q84KNTc';

    const {lat, lng} = await geocodeAddress(address, apiKey)

    // After all the guards, creating a new user
    const newUser = {
        name,
        phoneNumber,
        location: {
            type: 'Point',
            coordinates: [lng, lat]
          },
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


app.post("/users/:userName/update",async(req,res) => {
    const userName = req.params.userName;

    console.log(req.body);

    const existingUser = await Receiver.findOne({ userName: userName }).exec();
    if(!existingUser){
        await Receiver.create({userName:userName,bloodTypes:req.body.bloodTypes}).then((data) => {
            console.log(`Saving details in DB for user with user name ${userName}`)
            res.status(201).send({
                "status": "success",
                "userName": userName,
            })
        }).catch((err) => {
            console.error(`Error in signing up for user with userName ${userName}`);
            res.status(500).send(`Unable to create a new user for username as ${userName}`);
        })
    }
    else{
        const bloodTypesToUpdate = {};
        Object.entries(req.body.bloodTypes).forEach(([bloodType, count]) => {
        if (count > 0) {
            bloodTypesToUpdate[`bloodTypes.${bloodType}`] = count;
        }
        });

        await Receiver.findOneAndUpdate(
        { userName: userName },
        { $inc: bloodTypesToUpdate },
        { new: true }
        )
        .then((data) => {
        console.log(`Updating details for receiver in DB with user name ${userName}`);
        res.status(201).send(``);
        })
        .catch((err) => {
        console.log(`Error in updating blood type count for users with user name ${userName}`);
        res.status(500).send("Internal Server Error! Unable to ")
        });
    }});


/*
app.put("/users/:userName/update", async (req, res) => {
    const userName = req.params.userName;
  
    console.log(req.body); // Check if the request body is correct
  
    try {
      const existingUser = await Receiver.findOne({ userName: userName }).exec();
      if (!existingUser) {
        await Receiver.create({ userName: userName, bloodTypes: req.body.bloodTypes });
        console.log(`Saving details in DB for user with userId ${userId}`);
        res.status(201).send({
          "status": "success",
          "userId": userName,
        });
      } else {
        console.log(`Existing user found: ${existingUser}`);
        await Receiver.findOneAndUpdate({ userName: userName }, { $inc: req.body.bloodTypes });
        console.log(`Updating details for receiver in DB with user id ${userName}`);
        res.status(201).send(``);
      }
    } catch (err) {
      console.error(`Error in updating blood type count for users with user id ${userName}: ${err}`);
      res.status(500).send("Internal Server Error! Unable to update blood type count");
    }
  });

  */
  


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

app.post("/:userName/emergency",async(req,res)=>{
    const userName = req.params.userName;
    const bloodType = req.body.bloodType;
    await User.find({userName:userName}).exec().then(async(data)=>{
        const responseFromDb = data[0];
        const lat = responseFromDb.location.coordinates[1];
        const long = responseFromDb.location.coordinates[0];
        const unitValue = 1000;
        const users =  await User.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [long, lat]
                    },
                    distanceField: 'distance',
                    maxDistance: DISTANCE * unitValue,
                    spherical: true
                }
            },
            {
                $match: {
                    bloodGroup: bloodType
                }
            },
            {
                $sort: {
                    distance: 1
                }
            }
        ]);
        //Generate alerts to these users below
        res.send(users);
    })
})

app.get("/users/:userName/check", async (req, res) => {

    const userName = req.params.userName;

    // Temporary bullshit code. Should optimize
    await Receiver.find({userName:userName}).exec().then((data) => {
        const responseFromDb = data[0];
        const existingMapOfBlood = responseFromDb.bloodTypes;
        let requiredBlood = [];


        console.log(`Successfully fetched data for receiver with user name ${userName}`);

        for(const [key,value] of existingMapOfBlood)
        {
            if(value<MINIMUM)
            {
                requiredBlood.push(key);
            }
        }

        // NO REQUIREMENT. SENDS THE COUNT OF EXISTING BLOOD TYPES
        if(requiredBlood.length==0)
        {
           return res.status(201).send({quantities:existingMapOfBlood});
        }
        else{
            return res.status(201).send({quantities:existingMapOfBlood,required:requiredBlood})
        }

    }).catch((err) => {
        console.error(`Error in fetching details for user with user name  ${userName}`);
        res.status(500).send("INTERNAL SERVER ERROR: "+err);
    })


});

