const mongoose = require("mongoose");
const Doubt = require("../models/doubtModel");
const Course = require("../models/courseModel");
const Topic = require("../models/topicModel");

const createDoubt = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { title, description, courseId, topicId } = req.body;
        if (!title || !description || !courseId) {
            return res.status(400).json({ message: "Title, description and courseId are required" });
        }

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: "Invalid course id" });
        }

        const course = await Course.findOne({ _id: courseId, isDeleted: false });
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (topicId) {
            if (!mongoose.Types.ObjectId.isValid(topicId)) {
                return res.status(400).json({ message: "Invalid topic id" });
            }
            const topic = await Topic.findOne({ _id: topicId, courseId, isDeleted: false });
            if (!topic) {
                return res.status(404).json({ message: "Topic not found for this course" });
            }
        }

        const doubt = await Doubt.create({
            title,
            description,
            courseId,
            topicId,
            studentId: req.user.id
        });

        res.status(201).json({ message: "Doubt created successfully", data: doubt });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const listMyDoubts = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const doubts = await Doubt.find({ studentId: req.user.id, isDeleted: false })
            .populate("courseId", "title")
            .populate("topicId", "title")
            .populate("teacherReplies.teacherId", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({ message: "Doubts fetched successfully", data: doubts });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const listDoubtsForTeachers = async (req, res) => {
    try {
        if (req.user.role !== "teacher" && req.user.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const doubts = await Doubt.find({ isDeleted: false })
            .populate("studentId", "name email")
            .populate("courseId", "title createdBy")
            .populate("topicId", "title")
            .populate("teacherReplies.teacherId", "name email")
            .sort({ createdAt: -1 });

        const filteredDoubts =
            req.user.role === "admin"
                ? doubts
                : doubts.filter((doubt) => doubt.courseId?.createdBy?.toString() === String(req.user.id));

        res.status(200).json({ message: "Doubts fetched successfully", data: filteredDoubts });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const replyToDoubt = async (req, res) => {
    try {
        if (req.user.role !== "teacher" && req.user.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { doubtId } = req.params;
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: "Reply message is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(doubtId)) {
            return res.status(400).json({ message: "Invalid doubt id" });
        }

        const doubt = await Doubt.findOne({ _id: doubtId, isDeleted: false }).populate("courseId", "createdBy");
        if (!doubt) {
            return res.status(404).json({ message: "Doubt not found" });
        }

        const isOwnerTeacher = doubt.courseId?.createdBy?.toString() === String(req.user.id);
        if (req.user.role !== "admin" && !isOwnerTeacher) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        doubt.teacherReplies.push({
            teacherId: req.user.id,
            message
        });
        doubt.status = "open";
        await doubt.save();

        res.status(200).json({ message: "Reply added successfully", data: doubt });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateMyDoubt = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { doubtId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(doubtId)) {
            return res.status(400).json({ message: "Invalid doubt id" });
        }

        const doubt = await Doubt.findOne({
            _id: doubtId,
            studentId: req.user.id,
            isDeleted: false,
            status: "open"
        });

        if (!doubt) {
            return res.status(404).json({ message: "Doubt not found or cannot be edited" });
        }

        const { title, description, topicId } = req.body;
        const updates = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;

        if (topicId !== undefined) {
            if (topicId === null || topicId === "") {
                updates.topicId = null;
            } else {
                if (!mongoose.Types.ObjectId.isValid(topicId)) {
                    return res.status(400).json({ message: "Invalid topic id" });
                }
                const topic = await Topic.findOne({
                    _id: topicId,
                    courseId: doubt.courseId,
                    isDeleted: false
                });
                if (!topic) {
                    return res.status(404).json({ message: "Topic not found for this course" });
                }
                updates.topicId = topicId;
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        const updated = await Doubt.findOneAndUpdate(
            { _id: doubtId, studentId: req.user.id, isDeleted: false, status: "open" },
            updates,
            { new: true }
        )
            .populate("courseId", "title")
            .populate("topicId", "title")
            .populate("teacherReplies.teacherId", "name email");

        res.status(200).json({ message: "Doubt updated successfully", data: updated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteDoubt = async (req, res) => {
    try {
        const { doubtId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(doubtId)) {
            return res.status(400).json({ message: "Invalid doubt id" });
        }

        const doubt = await Doubt.findOne({ _id: doubtId, isDeleted: false }).populate("courseId", "createdBy");
        if (!doubt) {
            return res.status(404).json({ message: "Doubt not found" });
        }

        const isStudentOwner = doubt.studentId.toString() === String(req.user.id);
        const isTeacherOwner =
            req.user.role === "teacher" &&
            doubt.courseId?.createdBy?.toString() === String(req.user.id);
        const isAdmin = req.user.role === "admin";

        if (!isStudentOwner && !isTeacherOwner && !isAdmin) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        doubt.isDeleted = true;
        await doubt.save();

        res.status(200).json({ message: "Doubt deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const resolveDoubt = async (req, res) => {
    try {
        if (req.user.role !== "teacher" && req.user.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { doubtId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(doubtId)) {
            return res.status(400).json({ message: "Invalid doubt id" });
        }

        const doubt = await Doubt.findOne({ _id: doubtId, isDeleted: false }).populate("courseId", "createdBy");
        if (!doubt) {
            return res.status(404).json({ message: "Doubt not found" });
        }

        const isOwnerTeacher = doubt.courseId?.createdBy?.toString() === String(req.user.id);
        if (req.user.role !== "admin" && !isOwnerTeacher) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        doubt.status = "resolved";
        await doubt.save();

        res.status(200).json({ message: "Doubt resolved successfully", data: doubt });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createDoubt,
    listMyDoubts,
    listDoubtsForTeachers,
    replyToDoubt,
    resolveDoubt,
    updateMyDoubt,
    deleteDoubt
};
