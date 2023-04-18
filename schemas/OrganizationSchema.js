// importing the required modules
import latAndLong from "./LatAndLongObject.js";


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
        type: Object,
        required: true
    }
}


// exporting the schema
export default OrganizationSchema;