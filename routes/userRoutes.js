const { createUser, loginUser, getUserData, addTeacher, getAllTeachers, deleteTeacher, updateTeacher } = require("../controllers/userController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

const route = require("express").Router();


route.post("/register",createUser);
route.post("/",createUser);
route.post("/login",loginUser);

route.get("/me",authMiddleware,getUserData);

route.post("/add-teacher",authMiddleware,adminMiddleware,addTeacher);
route.get("/get-all-teachers",authMiddleware,adminMiddleware,getAllTeachers);
route.delete("/delete-teacher/:teacherId",authMiddleware,adminMiddleware,deleteTeacher);
route.put("/update-teacher/:teacherId",authMiddleware,adminMiddleware,updateTeacher);


module.exports = route;