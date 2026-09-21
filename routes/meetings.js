const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");

const router = express.Router();


// Mark attendance
router.post("/attendance", auth, async (req, res) => {

    try {

        const { memberId } = req.body;

        const currentUser =
            await User.findById(req.user.userId);

        if (
            currentUser.role !== "head" &&
            currentUser.role !== "manager"
        ) {
            return res.status(403).json({
                message: "Not allowed"
            });
        }

        const member = await User.findById(memberId);

        if (!member) {
            return res.status(404).json({
                message: "Member not found"
            });
        }

        member.meetingsAttended += 1;
        member.lastActivity = new Date();

        await member.save();

        res.json({
            message: "Attendance recorded",
            meetingsAttended: member.meetingsAttended
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});

module.exports = router;