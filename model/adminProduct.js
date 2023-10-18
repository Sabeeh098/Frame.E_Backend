const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['In Stock', 'No Stock']
    },
    photo: {
        type: String,  
    },
    deleted: {
        type: Boolean,
        default: false,
    }
});

const Product = mongoose.model('Products', productSchema);

module.exports = Product;
