const mongoose = require("mongoose");
const Topic = require("../models/topicModel");

const createTopic = async (req, res) => {
    try {
        const { title, content, order } = req.body;
        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }
        const topic = await Topic.create({
            title,
            content: content !== undefined ? content : "",
            order: order !== undefined ? order : 0,
            courseId: req.course._id
        });
        res.status(201).json({ message: "Topic created successfully", data: topic });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const listTopics = async (req, res) => {
    try {
        const topics = await Topic.find({
            courseId: req.course._id,
            isDeleted: false
        })
            .sort({ order: 1, createdAt: 1 })
            .lean();
        res.status(200).json({ message: "Topics fetched successfully", data: topics });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(topicId)) {
            return res.status(400).json({ message: "Invalid topic id" });
        }
        const topic = await Topic.findOne({
            _id: topicId,
            courseId: req.course._id,
            isDeleted: false
        });
        if (!topic) {
            return res.status(404).json({ message: "Topic not found" });
        }
        res.status(200).json({ message: "Topic fetched successfully", data: topic });
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid topic id" });
        }
        res.status(500).json({ message: err.message });
    }
};

const updateTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(topicId)) {
            return res.status(400).json({ message: "Invalid topic id" });
        }
        const { title, content, order } = req.body;
        const updates = {};
        if (title !== undefined) updates.title = title;
        if (content !== undefined) updates.content = content;
        if (order !== undefined) updates.order = order;
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }
        const topic = await Topic.findOneAndUpdate(
            { _id: topicId, courseId: req.course._id, isDeleted: false },
            updates,
            { new: true }
        );
        if (!topic) {
            return res.status(404).json({ message: "Topic not found" });
        }
        res.status(200).json({ message: "Topic updated successfully", data: topic });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(topicId)) {
            return res.status(400).json({ message: "Invalid topic id" });
        }
        const topic = await Topic.findOne({
            _id: topicId,
            courseId: req.course._id,
            isDeleted: false
        });
        if (!topic) {
            return res.status(404).json({ message: "Topic not found" });
        }
        topic.isDeleted = true;
        await topic.save();
        res.status(200).json({ message: "Topic deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createTopic, listTopics, getTopic, updateTopic, deleteTopic };
