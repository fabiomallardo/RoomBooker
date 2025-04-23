import mongoose, { Schema } from 'mongoose';

const reviewSchema = new Schema({
    strutturaId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Struttura', 
        required: true 
    },
    customerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Customer', 
        required: true 
    },
    rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 
    },
    comment: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
