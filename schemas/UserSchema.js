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

    location: {
        type: {
          type: String,
          default: 'Point'
        },
        coordinates: {
          type: [Number],
          index: '2dsphere'
        }
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
}
// exporting the schema
export default UserSchema;
