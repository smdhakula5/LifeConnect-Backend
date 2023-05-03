const ReceiverSchema = {
    userName: {
        type: String,
        required: true
    },
    bloodTypes: {
        type: Map,
        of: Number,
        required: true,
        default: {
            "A+": 0,
            "A-": 0,
            "B+": 0,
            "B-": 0,
            "AB+": 0,
            "AB-": 0,
            "O+": 0,
            "O-": 0
        }
    },
    latitude:{
      type: String,
      required:false
    },
    longitude:{
      type: String,
      required:false
    }
    
};

export default ReceiverSchema;