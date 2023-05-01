// Importing required modules
const ReceiverSchema = require("../schemas/ReceiverSchema")
const mongoose = require("mongoose");


// Defining the model and exporting it
export default mongoose.model("Receiver", ReceiverSchema);


