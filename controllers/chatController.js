const { default: mongoose } = require("mongoose");
const chatModel = require("../model/chat");
const messageModel = require("../model/messages");
const userModel = require("../model/userModel");
const artistModel = require("../model/artistModel");

// const accessChat = async (req,res) => {
//     try{
//         const senderId = req.query.senderId;
//         const recieverId = req.query.recieverId

//         if(req.payload.role === 'user'){
//             const data = await userModel.findOne({_id:id},{_id:1});
//             userId = data._id;
//             artistId = new mongoose.Types.ObjectId(req.payload.id);
//         }
//         if(req.payload.role === 'artist'){
//             const data = await artistModel.findOne({_id:id},{_id:1});
//             userId = new mongoose.Types.ObjectId(req.payload.id);
//             artistId = data._id;
//         }
//         const findQuery = {
//             senderId: senderId,
//             recieverId: recieverId
//         };
//         const isChat = await chatModel.findOne(findQuery);

//         if(isChat){
//             res.sendStatus(200);
//         }else {
//             const chatData = {
//                 senderId: senderId,
//                 recieverId: recieverId
//             };
//             await chatModel.create(chatData);
//             res.sendStatus(200)
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Internal Server Error');
//     }
// }

// const fetchChats = async (req,res) => {
//     try{
//         const userId = new mongoose.Types.ObjectId(req.payload.id);
//         const userRole = req.payload.role === 'user' ? 'user' : 'artist';

//         const chats = await chatModel.find({[userRole]: userId})
//         .populate({path:'user', select: 'userName photo email'})
//         .populate({path: 'artist' ,select: 'name email'})
//         .populate({
//             path: 'latestMessage',
//             populate: {path: 'sender',select: 'userName photo email'}
//         })
//         .sort({updatedAt: -1});

//         res.status(200).json({chats});
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
// }

// const sendMessage = async (Message) => {
//     console.log("100001");
//     console.log(Message);
//     try {
//         const senderId = new mongoose.Types.ObjectId(Message.senderId);
//         const chatId = new mongoose.Types.ObjectId(Message.chatId);

//         const newMessage = {
//             sender: senderId,
//             content: Message.content,
//             chat: chatId,
//             senderType: Message.role
//         };

//         let message = await messageModel.create(newMessage);

//         await chatModel.findByIdAndUpdate(chatId, {
//             latestMessage: message
//         });

//         return true;
//     } catch (error) {
//         console.error(error);
//         return false;
//     }
// };
// const allMessages = async (req, res) => {
//     try {
//         const chatId = new mongoose.Types.ObjectId(req.query.chatId);

//         const messages = await messageModel
//             .find({ chat: chatId })
//             .populate({
//                 path: 'sender',
//                 select: 'name image email',
//                 populate: {
//                     path: 'artist', // You might need to adapt this path if it's 'user' in some cases
//                     model: 'Artist'
//                 }
//             })
//             .populate('chat');

//         res.status(200).json({ result: messages });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

const createChat = async (req, res) => {
  try {
    const { artistId, userId, senderRole } = req.body;
    

    let userid = userId
    let artistid = artistId

    if (senderRole === "User") {
      const findQuery = {
        user: userid,
        artist: artistid,
      };
      const selectedChat = await chatModel.findOne(findQuery)
      // const previousChat = await chatModel.find({ user:userid }).populate({
      //   path: "artist",
      //   select: "name profilePicture",
      // });
     
      if (selectedChat) {
        // return res.status(200).json({ selectedChat, previousChat });
        return res.status(200)
      } else {
        const chatData = {
          user: userid,
          artist: artistid,
        };

        const newChat = await chatModel.create(chatData);
        // res.status(200).json({ selectedChat:newChat, previousChat });
        return res.status(200)
      }

    }
  } catch (error) {
    console.log(error);
  }
};

const fetchChats = async (req, res) => {
  try {
    console.log("try from aartist")
    const { userId, artistId, senderRole } = req.query;
    let userid = userId;
    let artistid = artistId;

    let senderId;
      let senderIdField

      if (senderRole === 'User') {
        senderId = new mongoose.Types.ObjectId(req.payload.id);
        senderIdField = 'user'
      }else{
        senderId = new mongoose.Types.ObjectId(req.payload.id);
        senderIdField = 'artist'
    }
    const chats = await chatModel
        .find({[senderIdField]: senderId })
        .populate({ path: 'user', select: 'userName  photo' })
        .populate({ path: 'artist', select: 'name profilePicture' })
        .populate({ path: 'latestMessage', populate: { path: 'senderId', select: 'userName photo name profilePicture' } })
        .sort({ updatedAt: -1 });
    res.status(200).json({ chatList : chats })

    // if (senderRole === 'user') {
    //   const findQuery = {
    //     user: userid,
    //     artist: artistid,
    //   };
    //   const selectedChat = await chatModel.findOne(findQuery)
    //     .populate({
    //       path: 'artist',
    //       select: 'name profilePicture',
    //     }).populate("latestMessage");
    //     console.log(selectedChat,selectedChat.latestMessage,"hellllo")
    //   const previousChat = await chatModel.find({ user: userid }).populate({
    //     path: 'artist',
    //     select: 'name profilePicture',
    //   });
    //   res.status(200).json({ selectedChat, previousChat });
    // } else {
   
    //   const chats = await chatModel.find({ artist: artistid }).populate({
    //     path: 'user',
    //     select: 'userName photo',
    //   });
    //   return res.status(200).json({ allChats: chats });
    // }
  } catch (error) {
    console.log(error);
  }
}



const sendMessage = async (messages) => {
  try {
    console.log("sendMessage function called:", messages);
    const { senderId, chatId, content, senderRole, time } = messages;

    // Check if the sender is a user or an artist
    const senderType = senderRole === 'User' ? 'User' : 'Artist';

    const newMessage = new messageModel({
      content,
      chatId,
      senderId,
      senderType, // Use the determined senderType
      time,
    });

    await newMessage.save();

    // Update the latest message in the chat
    console.log("sendMessage function completed successfully");
    const chat = await chatModel.findByIdAndUpdate(
      chatId,
      { latestMessages: newMessage._id },
      { new: true } // Ensure that the updated chat document is returned
    );

    return true;
  } catch (error) {
    console.log(error);
    return false; // Return false to indicate that there was an error
  }
};

const fetchAllMessages = async (req,res)=>{
  try {
    const messages = await messageModel.find({chatId : req.query.chatId})
      // .populate("senderId","userName photo name profilePicture")
      // .populate("chatId")
       res.status(200).json({allMessages:messages})
  } catch (error) {
      console.log(error);
      return res.status(500)
  }
}

module.exports = {
  createChat,
  fetchChats,
  sendMessage,
  fetchAllMessages,
};

// sendMessage,
// getMessages,
// const sendMessage = async (req, res) => {
//   try {
//     const { senderId, recieverId, content } = req.body;
//     const chat = await chatModel.findOneAndUpdate({
//       $or: [
//         { user: senderId, artist: recieverId },
//         { user: recieverId, artist: senderId },
//       ],
//     },
//     {},
//     {upsert:true,new:true}
//     );

//     const message = new messageModel({
//         content,
//         senderId,
//         senderType:'User',
//         chatId:chat._id,
//     });
//     await message.save();

//     chat.latestMessage = message._id;
//     await chat.save();
//     res.status(200).json({ message: 'Message sent successfully' });
//   } catch (error) {
//     console.error('Error sending message:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// const getMessages = async (req,res) => {
//     try{
//      const chatId = req.params.chatId;

//      const message = await messageModel.find({chatId}).sort('createdAt');
//      res.status(200).json(messages);
//     } catch (error) {
//         console.error('Error retrieving messages:', error);
//         res.status(500).json({ error: 'Internal server error' });
//       }
// }
