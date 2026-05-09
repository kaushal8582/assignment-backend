const mongoose = require("mongoose");
const Course = require("../models/courseModel");

const loadCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: "Invalid course id" });
        }
        const course = await Course.findOne({ _id: courseId, isDeleted: false });
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        req.course = course;
        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const requireCourseOwnerOrAdmin = (req, res, next) => {
    const course = req.course;
    const userId = req.user.id;
    const role = req.user.role;
    if (role === "admin") {
        return next();
    }
    if (course.createdBy.toString() === String(userId)) {
        return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
};

module.exports = { loadCourse, requireCourseOwnerOrAdmin };
