const mongoose = require("mongoose");
const Course = require("../models/courseModel");

const createCourse = async (req, res) => {
    try {
        const { title, description, bannerImage } = req.body;
        if (!title || !description) {
            return res.status(400).json({ message: "Title and description are required" });
        }
        const course = await Course.create({
            title,
            description,
            bannerImage,
            createdBy: req.user.id
        });
        res.status(201).json({ message: "Course created successfully", data: course });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const listCourses = async (req, res) => {
    try {
        const filter = { isDeleted: false };
        if (req.query.mine === "true") {
            if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
                return res.status(400).json({ message: "Invalid user id" });
            }
            filter.createdBy = req.user.id;
        }
        const courses = await Course.find(filter)
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json({ message: "Courses fetched successfully", data: courses });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getCourse = async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.course._id, isDeleted: false }).populate(
            "createdBy",
            "name email"
        );
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.status(200).json({ message: "Course fetched successfully", data: course });
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid course id" });
        }
        res.status(500).json({ message: err.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { title, description, bannerImage } = req.body;
        const updates = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (bannerImage !== undefined) updates.bannerImage = bannerImage;
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }
        const course = await Course.findOneAndUpdate(
            { _id: req.course._id, isDeleted: false },
            updates,
            { new: true }
        ).populate("createdBy", "name email");
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.status(200).json({ message: "Course updated successfully", data: course });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.course._id, isDeleted: false });
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        course.isDeleted = true;
        await course.save();
        res.status(200).json({ message: "Course deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createCourse, listCourses, getCourse, updateCourse, deleteCourse };
