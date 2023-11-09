const mongoose = require('mongoose');

const adminOrderSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    products: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId, // Reference to the product ordered
            ref: 'Product', // Replace 'Product' with the actual product model name
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
        },
      ],

     totalAmount: {
        type: Number,
     },
     orderDate: {
        type: Date,
        default: Date.now,
     },
     status:{
        type: String,
        required: true,
        enum: ['pending','processing','completed'],
     } 
})

const adminOrders = mongoose.model("AdminOrders", adminOrderSchema);
module.exports = adminOrders;