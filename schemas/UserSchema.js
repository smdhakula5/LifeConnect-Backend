// Importing the required modules
const latAndLong = require("./LatAndLongObject.js")


// Schema of Every User
const UserSchema = {
    name: {
        type: String,
        required: true
    },

    bloodGroup: {
        type: String,
        required: true
    },

    permanentAddress: {
        type: latAndLong,
        required: true
    },

    currentAddress: {
        type: latAndLong,
        required: false
    },
    phoneNumber: {
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
    }

}


// exporting the schema
module.exports = UserSchema
