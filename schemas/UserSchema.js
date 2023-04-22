// Importing the required modules
import latAndLong from "./LatAndLongObject.js";


// Schema of Every User
const UserSchema = {
    name: {
        type: String,
        required: true
    },

    bloodGroup: {
        type: String,
        required: false
    },

    permanentAddress: {
        type: Object,
        required: true
    },

    currentAddress: {
        type: Object,
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
    },

    bloodGroups: [
        BloodGroupCountsSchema
    ]
}

const BloodGroupCountsSchema = new Schema({
    bloodGroup: { type: String, required: true },
    count: { type: Number, required: true, default: 0 }
});




// exporting the schema
export default UserSchema;
