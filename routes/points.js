const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const mongoose = require("mongoose")
const router = express.Router();


// Give points
router.post("/give", auth, async (req, res) => {

    try {

        const { memberId, points } = req.body;

        const currentUser =
            await User.findById(req.user.userId);

        if (
            currentUser.role !== "head" &&
            currentUser.role !== "manager"
        ) {
            return res.status(403).json({
                message: "Only Head or Manager can give points"
            });
        }

        const member = await User.findById(new mongoose.Types.ObjectId(memberId));

        if (!member) {
            return res.status(404).json({
                message: "Member not found"
            });
        }

        // Make sure manager is actually above this member
        if (
            currentUser.role === "manager" &&
            member.parentId.toString() !==
            currentUser._id.toString()
        ) {
            return res.status(403).json({
                message: "You don't manage this member"
            });
        }
         if (
            currentUser.role === "head" &&
            member.parentId.toString() !==
            currentUser._id.toString()
        ) {
            return res.status(403).json({
                message: "You don't manage this manager"
            });
        }

        member.credit += Number(points);

        member.lastActivity = new Date();

        await member.save();

        res.json({
            message: "Points added",
            credit: member.credit
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});


// Leaderboard
router.get("/leaderboard", async (req, res) => {

    const members = await User.find({
        role: "member"
    })
    .select("name credit");

    members.sort(
        (a, b) => b.creditPoints - a.creditPoints
    );

    res.json(members);
});

module.exports = router;