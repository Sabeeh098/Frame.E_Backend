const {generateToken} = require('../middlewares/auth');
const adminModel = require("../model/adminModel");
const userModel = require("../model/userModel")
const bcrypt = require('bcrypt');
let errMsg;


const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body,"dfrchfghftguhfg");
        const admin = await adminModel.findOne({ email:email });

        if (!admin) {
            console.log("mmmmm")
            // Handle the case where no admin with the given email is found.
            return res.status(401).json({ errMsg: "Admin not found" });

        }

        const passwordMatch = await adminModel.findOne({
            _id: admin._id,
            password: password // Check if the provided password matches
        });

        if (!passwordMatch) {
            console.log("here");
            return res.status(401).json({ errMsg: "Password didn't match" });
        }

        const token = generateToken(passwordMatch._id, 'admin');
        res.status(200).json({
            message: "Login Successful",
            name: passwordMatch?.name,
            token,
            role: 'admin',
            id: passwordMatch._id
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ errMsg: "Something Went Wrong" });
    }
}

const users = async (req,res)=>{
    try{
        const userData = await userModel.find();
        res.status(200).json({userData});
    } catch (error){
        res.status(500).json({errMsg:"Something went Wrong"})
    }
}
const blockUser = async(req,res)=>{
    try{
        const {userId} = req.body;
        const user = await userModel.findById(userId);
        if(!user){
            return res.status(400).json({errMsg:"User Not found"})
        }
        user.isActive = true;
        user.save()
        return res.status(200).json({message:"Blocked Succeffully"})
    } catch (error){
        return res.status(500).json({errMsg:"something went wrong"})
    }
}

const unblockUser = async(req,res)=>{
    try{
        const {userId} = req.body;
        const user = await userModel.findById(userId);
        if(!user){
            return res.status(400).json({errMsg:"User not found"});
        } 
        user.isActive = false;
        user.save();
        return res.status(200).json({message:"unblocked"})
    } catch(error){

    }
}

module.exports = {adminLogin,users,blockUser,unblockUser}