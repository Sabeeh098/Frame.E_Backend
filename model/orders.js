const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
    },

    items : [
        {
            posts: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Posts',
            }
        },
    ],
    amount : {
        type: String,
        required: true,

    },
    ShippingAddress:{
        type: String,

    },
    createdAt : {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        default: 'pending',
    }
})

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;