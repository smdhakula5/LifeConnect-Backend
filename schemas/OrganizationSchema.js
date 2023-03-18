// importing the required modules
const latAndLong = require("./LatAndLongObject.js")


// defining organization schema
const OrganizationSchema = {
    name: {
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

    address: {
        type: latAndLong,
        required: true
    }
}


// exporting the schema
module.exports = OrganizationSchema;