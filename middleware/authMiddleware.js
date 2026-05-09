const jwt = require("jsonwebtoken");

const verifyToken  =  async(token)=>{
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    }catch(err){
        return null;
    }
}

const authMiddleware = async (req,res,next)=>{
    const token = req.headers.authorization;
    if(!token){
        return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = await verifyToken(token);
    if(!decoded){
        return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = decoded;
    next();
}


const adminMiddleware = async (req,res,next)=>{
    if(req.user.role !== "admin"){
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
}

const teacherMiddleware = async (req,res,next)=>{
    if(req.user.role !== "teacher" && req.user.role !== "admin"){
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
}





module.exports = { authMiddleware,adminMiddleware,teacherMiddleware };