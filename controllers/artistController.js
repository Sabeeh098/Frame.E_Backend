const { generateToken } = require('../middlewares/auth');
const artistModel = require('../model/artistModel');
const bcrypt = require('bcrypt');
let errMsg;


const artistRegister = async(req,res)=>{
    try{
        const {name,email,password} = req.body;
        console.log(req.body);
        const exist = await artistModel.find({email});
        if(exist.length !== 0 ){
            return res.status(400).json({errMsg:"You are already exist"})
        }
        const hashpass = await bcrypt.hash(password,10);
        const artist = new artistModel({name,email,password:hashpass})
        await artist.save()
        console.log("Artist inserted")
        res.status(200).json({message:"Artist Registered Successful"});
    }catch(error){
        console.log("Error Registering",error);
        res.status(500).json({message:"Server Error"})
    }
}

const artistLogin = async (req,res) =>{
    try{
    const {email,password} = req.body;
    const artist = await artistModel.findOne({email});
    if(!artist){
        return res.status(401).json({errMsg:"Please register first"});
    }
    const passwordMatch = await bcrypt.compare(password,artist.password);
    if(!passwordMatch){
        return res.status(401).json({errMsg:"Password doesn't match"})
    }
    const token = generateToken(passwordMatch._id,'artist');
    res.status(200).json({message:"Login Successfull",name:passwordMatch?.name,token, role:'artist',id:passwordMatch?._id})
 
 }catch (error){
    res.status(500).json({errMsg:"Something went wrong"})
 }

}

module.exports = {
    artistRegister,
    artistLogin, 
    
}