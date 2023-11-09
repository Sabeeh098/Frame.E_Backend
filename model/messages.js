const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content : {
        type: String,
        trim: true,
        required: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'senderType',
        required: true,
    },
    senderType: {
        type : String,
        enum:['User','Artist']
    },
    chatId: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Chat', 
    },
    time: {
        type: Date,
        default:Date.now()
    },

},{
    timestamps:true
});

const messageModel = mongoose.model('Messages',messageSchema);

module.exports = messageModel;