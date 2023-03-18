// Importing required modules
const UserSchema = require("../schemas/OrganizationSchema")
const mongoose = require("mongoose");


// Defining the model and exporting it
module.exports = mongoose.model("Organization", OrganizationSchema);


