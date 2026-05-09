const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



const createUser = async (req, res) => {
    try{
        const { name, email, password } = req.body;

        if(!name || !email || !password){
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email,isDeleted:false });
        if(existingUser){
            return res.status(409).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });
        res.status(201).json({ user });

    }catch(err){
        res.status(500).json({ message: err.message });
    }
}


const loginUser = async (req,res)=>{
    try{

        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email,isDeleted:false });
        if(!user){
            return res.status(400).json({ message: "User not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ id: user._id,role:user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        delete user.password;
        res.status(200).json({message:"Login successful",data :{user,token} })
    }catch(err){
        res.status(500).json({ message: err.message });
    }
}

const getUserData = async (req,res)=>{
    try{
        const userId = req.user.id;
        const user = await User.findOne({_id:userId,isDeleted:false}).select("-password");
        if(!user){
            return res.status(400).json({ message: "User not found" });
        }
        res.status(200).json({message:"User data fetched successfully",data :user })
    }catch(err){
        res.status(500).json({ message: err.message });
    }
}

const addTeacher = async (req,res)=>{
    try{

        const {name,email,password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email,isDeleted:false });
        if(existingUser){
            return res.status(409).json({ message: "Teacher already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword,role:"teacher" });
        res.status(201).json({ message: "Teacher added successfully",data :user });

    }catch(err){
        res.status(500).json({ message: err.message });
    }
}

const getAllTeachers = async (req,res)=>{
    try{
        const teachers = await User.find({role:"teacher",isDeleted:false}).select("-password");
        if(teachers?.length === 0){
            return res.status(404).json({ message: "No teachers found" });
        }
       
        res.status(200).json({ message: "Teachers fetched successfully",data :teachers });
    }catch(err){
        res.status(500).json({ message: err.message });
    }
}

const deleteTeacher = async (req,res)=>{
    try{
        const {teacherId} = req.params;
        const teacher = await User.findOne({_id:teacherId,isDeleted:false,role:"teacher"});
        if(!teacher){
            return res.status(404).json({ message: "Teacher not found" });
        }

        teacher.isDeleted = true;
        await teacher.save();
        res.status(200).json({ message: "Teacher deleted successfully"});

    }catch(err){
        res.status(500).json({ message: err.message });
    }
}

const updateTeacher = async (req,res)=>{
    try{
        const {teacherId} = req.params;
        const {name} = req.body;
        if(!name){
            return res.status(400).json({ message: "Name is required" });
        }

        const teacher = await User.findOneAndUpdate({_id:teacherId,isDeleted:false,role:"teacher"},{name}, {new:true});

        if(!teacher){
            return res.status(404).json({ message: "Teacher not found" });
        }
        res.status(200).json({ message: "Teacher updated successfully",data :teacher });

    }catch(err){
        res.status(500).json({ message: err.message });
    }
}



module.exports = { createUser,loginUser,getUserData,addTeacher,getAllTeachers,deleteTeacher,updateTeacher};