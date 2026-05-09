const express = require("express");
const {
    createCourse,
    listCourses,
    getCourse,
    updateCourse,
    deleteCourse
} = require("../controllers/courseController");
const {
    createTopic,
    listTopics,
    getTopic,
    updateTopic,
    deleteTopic
} = require("../controllers/topicController");
const { topicAssist } = require("../controllers/topicAiController");
const { authMiddleware, teacherMiddleware } = require("../middleware/authMiddleware");
const { loadCourse, requireCourseOwnerOrAdmin } = require("../middleware/courseOwnerMiddleware");

const router = express.Router();
const topicRouter = express.Router({ mergeParams: true });

topicRouter.get("/", listTopics);
topicRouter.post("/", teacherMiddleware, requireCourseOwnerOrAdmin, createTopic);
topicRouter.post("/:topicId/ai", topicAssist);
topicRouter.get("/:topicId", getTopic);
topicRouter.patch("/:topicId", teacherMiddleware, requireCourseOwnerOrAdmin, updateTopic);
topicRouter.delete("/:topicId", teacherMiddleware, requireCourseOwnerOrAdmin, deleteTopic);

router.post("/", authMiddleware, teacherMiddleware, createCourse);
router.get("/", authMiddleware, listCourses);
router.use("/:courseId/topics", authMiddleware, loadCourse, topicRouter);
router.get("/:courseId", authMiddleware, loadCourse, getCourse);
router.patch("/:courseId", authMiddleware, teacherMiddleware, loadCourse, requireCourseOwnerOrAdmin, updateCourse);
router.delete(
    "/:courseId",
    authMiddleware,
    teacherMiddleware,
    loadCourse,
    requireCourseOwnerOrAdmin,
    deleteCourse
);

module.exports = router;
