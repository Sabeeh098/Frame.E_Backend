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
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', 
            required: true,
          },
        },
      ],
      price: {
        type:Number,
        required : true,
      },

      quantity: {
        type: Number,
        required: true,
      },
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
        default: "pending",
     } 
})

const adminOrders = mongoose.model("AdminOrders", adminOrderSchema);
module.exports = adminOrders;