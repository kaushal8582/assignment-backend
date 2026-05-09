
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    bannerImage :{
        type: String,
        required: false,
    },
    joinUsers:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    }],
   
},{timestamps: true});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;