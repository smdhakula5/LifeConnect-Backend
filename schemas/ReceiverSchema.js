const ReceiverSchema = new mongoose.Schema({
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
    location: {
        type: {
          type: String,
          default: 'Point'
        },
        coordinates: {
          type: [Number],
          index: '2dsphere'
        }
      }
    
});

export default ReceiverSchema;