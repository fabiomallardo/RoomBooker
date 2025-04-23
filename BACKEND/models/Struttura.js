import mongoose, { Schema } from 'mongoose';

const strutturaSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    type : {
        type : String,
        required : true,
        enum : ["Hotel", "Appartamenti", "Cottage", "Residence", "Bed & Breakfast"]
    },
    description: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,  
        max: 5, 
    },
    pricePerNight: {
        type: Number,
        required: true,
    },
    images: [String],
    cloudinaryIds: [String],
    ownerId: {  
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',  
        required: true,
    },
    location : {
        type : {
            type : String,  
            enum : ["Point"],
            required: true
        },
        coordinates : {
            type : [Number], //convenzione è che longitudine primo numero e latitudine secondo numero
            required: true,
        }
    }
}, { timestamps: true });

const Struttura = mongoose.model('Struttura', strutturaSchema);
export default Struttura;
