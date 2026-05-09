const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    content: {
        type: String,
        default: ""
    },
    order: {
        type: Number,
        default: 0
    },

},{timestamps: true});

const Topic = mongoose.model("Topic", topicSchema);

module.exports = Topic;
