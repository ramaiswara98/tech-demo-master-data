const express = require('express');
const router = express.Router();

const taskController = require("../controller/task");

router.post("/create-task", taskController.createTask);
router.post("/get-task-list-by-organiser-id", taskController.getTaskListByOrganiserId)
router.get("/get-all-task-list", taskController.getAllTaskList);
router.post("/get-task-by-id", taskController.getTaskById);
router.post("/submit-task", taskController.submitTask);
router.post("/appreciate-respondent", taskController.appreciateRespondent)
module.exports = router;