// Importing the required modules
import latAndLong from "./LatAndLongObject.js";


// Schema of Every User
const UserSchema = {
    name: {
        type: String,
        required: true
    },

    phoneNumber: {
        type: String,
        required: true
    },

    permanentAddress: {
        type: String,
        required: true
    },

    userName: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    // Fields specific to Donor
    bloodGroup: {
        type: String,
        required: false
    },

    // Fields specific to Hospital
    bloodGroups: [
        {
            bloodType: {
                type: String,
                required: true
            },
            count: {
                type: Number,
                required: true,
                default: 0
            }
        }
    ]
}
// exporting the schema
export default UserSchema;

/*

// Donor User
const donorUser = {
  name: "John Doe",
  phoneNumber: "1234567890",
  userName: "johndoe",
  password: "password123",
  bloodGroup: "A+"
};

// Hospital User
const hospitalUser = {
  name: "XYZ Hospital",
  phoneNumber: "0987654321",
  userName: "xyzhospital",
  password: "password456",
  bloodGroups: [
    { bloodType: "A+", count: 10 },
    { bloodType: "B+", count: 5 },
    { bloodType: "AB+", count: 7 },
    { bloodType: "O+", count: 12 },
    { bloodType: "A-", count: 3 },
    { bloodType: "B-", count: 2 },
    { bloodType: "AB-", count: 1 },
    { bloodType: "O-", count: 4 }
  ]
};

*/
