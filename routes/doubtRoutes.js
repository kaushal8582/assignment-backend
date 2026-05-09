const route = require("express").Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const {
    createDoubt,
    listMyDoubts,
    listDoubtsForTeachers,
    replyToDoubt,
    resolveDoubt,
    updateMyDoubt,
    deleteDoubt
} = require("../controllers/doubtController");

route.post("/", authMiddleware, createDoubt);
route.get("/my", authMiddleware, listMyDoubts);
route.get("/", authMiddleware, listDoubtsForTeachers);
route.post("/:doubtId/reply", authMiddleware, replyToDoubt);
route.patch("/:doubtId/resolve", authMiddleware, resolveDoubt);
route.patch("/:doubtId", authMiddleware, updateMyDoubt);
route.delete("/:doubtId", authMiddleware, deleteDoubt);

module.exports = route;
