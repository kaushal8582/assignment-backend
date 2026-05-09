const mongoose = require("mongoose");

const teacherReplySchema = new mongoose.Schema(
    {
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        message: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

const doubtSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },
        topicId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Topic",
            required: false
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["open", "resolved"],
            default: "open"
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        teacherReplies: [teacherReplySchema]
    },
    { timestamps: true }
);

const Doubt = mongoose.model("Doubt", doubtSchema);

module.exports = Doubt;
