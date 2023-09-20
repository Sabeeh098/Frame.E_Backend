const userModel = require ('../model/userModel')
const bcrypt = require('bcrypt');
const {generateToken} = require("../middlewares/auth")
let errMsg
const userRegister = async (req,res)=>{
    try{
        const {userName,email,password} = req.body;
        console.log(req.body,"HELOOOO")
        const exist = await userModel.find({email});
        if(exist.length !==0){
            return res.status(400).json({ Errmessage: "User already exists" });
        }
        const hashpass = await bcrypt.hash(password,10);
        const user = new userModel({userName,email,password:hashpass});
        await user.save()
        console.log("user Inserted");
        res.status(200).json({message:"User registered Successfully"})
    }catch(error){
        console.error("Error Registering",error);
        res.status(500).json({ message: "Server error at registration" });
    }
}

const login = async(req,res)=>{
    try{
        const {email,password} =req.body;
        const existUser = await userModel.findOne({email});
        if(!existUser)return  res.status(401).send({errMsg:"User Not Found"});

        const passwordMatch = await bcrypt.compare(password,existUser.password);
        if (!passwordMatch ){
            return res.status(401).json({errMsg:"Password didn't match"})
        }
        const token = generateToken(passwordMatch._id, "user");
        res.status(200).json({message:"Login Successful", name:passwordMatch?.name, token, role: 'user',id:passwordMatch._id})
    } catch (error){
        console.log(error);
        res.status(500).json({errMsg:"Something Went Wrong"})
    }

}


module.exports = {
    userRegister,
    login,
  
    }