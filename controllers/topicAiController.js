const mongoose = require("mongoose");
const Topic = require("../models/topicModel");
const { generateGeminiText } = require("../services/geminiTopicAssist");

function buildPrompt(mode, topicTitle, content) {
    const header =
        "You are helping students learn from course material. Only use information present in the SOURCE below. Do not invent facts, examples, or sources not implied by the text. If the source is vague, say so briefly.\n\n";

    const sourceBlock = `SOURCE TITLE: ${topicTitle}\n\nSOURCE CONTENT:\n${content}\n\n`;

    if (mode === "summary") {
        return (
            header +
            sourceBlock +
            "Task: Write a concise summary using bullet points where helpful. Use clear, simple language. Format using Markdown (short headings if needed, **bold** for key terms, bullet lists)."
        );
    }

    return (
        header +
        sourceBlock +
            "Task: Provide a detailed, step-by-step explanation suitable for a student revising this topic. Expand ideas that appear in the source only; organize with short Markdown sections (## headings), numbered steps where appropriate, and **bold** for important terms."
    );
}

const topicAssist = async (req, res) => {
    try {
        const { topicId } = req.params;
        const mode = req.body?.mode;

        if (!mongoose.Types.ObjectId.isValid(topicId)) {
            return res.status(400).json({ message: "Invalid topic id" });
        }
        if (mode !== "summary" && mode !== "detailed") {
            return res.status(400).json({ message: 'mode must be "summary" or "detailed"' });
        }

        const topic = await Topic.findOne({
            _id: topicId,
            courseId: req.course._id,
            isDeleted: false,
        }).lean();

        if (!topic) {
            return res.status(404).json({ message: "Topic not found" });
        }

        const content = typeof topic.content === "string" ? topic.content.trim() : "";
        if (!content) {
            return res.status(400).json({ message: "Topic has no content to summarize" });
        }

        const prompt = buildPrompt(mode, topic.title || "Topic", content);
        const result = await generateGeminiText(prompt);

        if (!result.ok) {
            return res.status(result.status).json({ message: result.message });
        }

        res.status(200).json({
            message: "Generated successfully",
            data: { text: result.text },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { topicAssist };
