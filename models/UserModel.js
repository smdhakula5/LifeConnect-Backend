// Importing required modules
const UserSchema = require("../schemas/UserSchema")
const mongoose = require("mongoose");


// Defining the model and exporting it
module.exports = mongoose.model("User", UserSchema);


