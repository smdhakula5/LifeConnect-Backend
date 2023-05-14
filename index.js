import UserSchema from './schemas/UserSchema.js';
import ReceiverSchema from './schemas/ReceiverSchema.js';
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import { Db,ServerApiVersion,MongoClient } from "mongodb";
import cors from "cors";
import dotenv from 'dotenv';

dotenv.config();

const MINIMUM = 5;
const DISTANCE = 10;

const app = express();
app.use(bodyParser.json());
app.use(cors());

const uri = "mongodb+srv://kapasy591:uNfI70FCPjMRqCIO@cluster0.09fyggc.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//     serverApi: {
//       version: ServerApiVersion.v1,
//       strict: true,
//       deprecationErrors: true,
//     }
//   });

//   async function run() {
//     try {
//       // Connect the client to the server    (optional starting in v4.7)
//       await client.connect();
//       // Send a ping to confirm a successful connection
//       await client.db("LifeConnect").command({ ping: 1 });
//       console.log("Pinged your deployment. You successfully connected to MongoDB!");
//     } finally {
//       // Ensures that the client will close when you finish/error
//       await client.close();
//     }
//   }
//   run().catch(console.dir);
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => {
      console.log('Connected to MongoDB');
      // Start your server or perform other operations
    })
    .catch((error) => {
      console.error('Error connecting to MongoDB:', error.message);
    });
const User = mongoose.model("User", UserSchema);
const Receiver = mongoose.model("Receiver",ReceiverSchema);

async function geocodeAddress(address, apiKey) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    const {lat, lng} = data.results[0].geometry.location;
    return {lat, lng};
}

async function sendPushNotification(bloodType,expoPushTokens) {
    const messages = expoPushTokens.map(user => ({
      to: user.pushToken,
      sound: 'default',
      title: 'Emergency!!',
      body: `Patient requires urgent blood transfusion, please help!`,
      data: { someData: 'goes here' },
    }));

  
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });
  }

  function getCompatibleBloodTypes(bloodType) {
    switch (bloodType) {
      case "A+":
        return ["A+", "A-", "O+", "O-"];
      case "A-":
        return ["A-", "O-"];
      case "B+":
        return ["B+", "B-", "O+", "O-"];
      case "B-":
        return ["B-", "O-"];
      case "AB+":
        return ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
      case "AB-":
        return ["A-", "B-", "AB-", "O-"];
      case "O+":
        return ["O+", "O-"];
      case "O-":
        return ["O-"];
      default:
        return [];
    }
  }
  
  


app.listen(3000,'0.0.0.0',() => {
    console.log("Server up and running on port 3000");
});

app.get('/', (req, res) => {
    res.send("Hello");
});

app.post('/',(req,res)=>{
    console.log(req.body.location);
    res.send();
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
    const { name, phoneNumber, location, userName, password, bloodGroup,pushToken } = req.body;

    console.log(req.body);
    
    if (!name || !phoneNumber || !location || !userName || !password || !pushToken) {
        console.error("Request body is missing required fields while signing up");
        return res.status(400).send({ "status": false, "message": "Request body is missing required fields while signing up!" });
    }

    const existingUser = await User.findOne({ userName: userName }).exec();
    if (existingUser) {
        console.error(`User already exists with username as ${userName}`);
        return res.status(403).send({ "status": false, "message": "User Already Exists!" });
    }

    const address = location;
    const apiKey = process.env.API_KEY;

    const {lat, lng} = await geocodeAddress(address, apiKey)

    const newUser = {
        name,
        phoneNumber,
        location: {
            type: 'Point',
            coordinates: [lng, lat]
          },
        userName,
        password,
        pushToken,
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


app.post("/:userName/emergency",async(req,res)=>{
    const userName = req.params.userName;
    const bloodType = req.body.bloodType;
    await User.find({userName:userName}).exec().then(async(data)=>{
        const responseFromDb = data[0];
        const lat = responseFromDb.location.coordinates[1];
        const long = responseFromDb.location.coordinates[0];
        const unitValue = 1000;
        const compatibleBloodTypes = getCompatibleBloodTypes(bloodType);
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
                    bloodGroup: { $in: compatibleBloodTypes },
                }
            },
            {
                $sort: {
                    distance: 1
                }
            }
        ]);
        console.log(users);
        const tokens = users.filter((user)=>user.pushToken!==undefined);
        sendPushNotification(bloodType,tokens);
        res.send(users);
    })
})

app.get("/users/:userName/check", async (req, res) => {

    const userName = req.params.userName;

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

