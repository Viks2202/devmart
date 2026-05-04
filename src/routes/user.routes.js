const express = require("express")
const router = express.Router()
const { protect, authorize } = require("../middlewares/auth.middleware")
const { getAllUsers, getUser, deleteUser } = require("../controllers/user.controller")

router.get("/", protect, authorize("admin"), getAllUsers)
router.get("/:id", protect, authorize("admin"), getUser)
router.delete("/:id", protect, authorize("admin"), deleteUser)

module.exports = router