const express = require("express");

const Duty = require("../models/duty");
const Attendance = require("../models/attendance");
const protect = require("../middleware/auth");
const User = require("../models/user")
const generateCode = require("../middleware/generateCode");

const router = express.Router();


// ============================================
// MANAGER CREATES DUTY
// ============================================

router.post("/", protect, async (req, res) => {

    try {
        const user = await User.findById(req.user.id)

        if (
            user.role !== "manager" &&
            user.role !== "head"
        ) {
            return res.status(403).json({
                message: "Only managers can create duties"
            });
        }


        const {
            dutyName,
            date
        } = req.body;


        if (!dutyName || !date) {

            return res.status(400).json({
                message: "Duty name and date are required"
            });

        }


        let secretCode;

        // Make sure the generated code is unique
        while (true) {

            secretCode = generateCode();

            const existing =
                await Duty.findOne({ secretCode });

            if (!existing) break;
        }


        const duty = await Duty.create({

            managerId: user._id,

            dutyName,

            date,

            secretCode,

            active: true

        });


        res.status(201).json({

            message: "Duty created successfully",

            duty

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to create duty"
        });

    }

});


// ============================================
// GET MANAGER'S DUTIES
// ============================================

router.get("/my", protect, async (req, res) => {

    try {
const user = await User.findById(req.user.id)
        const duties = await Duty.find({
          
        })
        .sort({ date: -1 });


        res.json(duties);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch duties"
        });

    }

});


// ============================================
// MEMBER MARKS ATTENDANCE
// ============================================

router.post("/attendance", protect, async (req, res) => {

    try {
const user = await User.findById(req.user.id)
        if (user.role !== "member") {

            return res.status(403).json({
                message: "Only members can mark attendance"
            });

        }


        const {
            secretCode
        } = req.body;


        if (!secretCode) {

            return res.status(400).json({
                message: "Secret code is required"
            });

        }


        // Find duty using code
        const duty = await Duty.findOne({
            secretCode: secretCode.toUpperCase(),
            active: true
        });


        if (!duty) {

            return res.status(400).json({
                message: "Invalid or inactive attendance code"
            });

        }


        // Make sure member has a manager
        if (!user.parentId) {

            return res.status(400).json({
                message: "No manager assigned to this member"
            });

        }


        // Prevent duplicate attendance
        const alreadyMarked =
            await Attendance.findOne({

                memberId: user._id,

                duty: duty.dutyName,

                date: duty.date

            });


        if (alreadyMarked) {

            return res.status(400).json({
                message: "Attendance already marked"
            });

        }


        // Create attendance
        const attendance =
            await Attendance.create({

                memberId: user._id,

                parentId: user.parentId,

                date: duty.date,

                duty: duty.dutyName,

                secretCode: duty.secretCode,

                status: "present"

            });


        res.status(201).json({

            message: "Attendance marked successfully",

            attendance

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to mark attendance"
        });

    }

});


// ============================================
// MEMBER'S ATTENDANCE
// ============================================

router.get("/attendance/my", protect, async (req, res) => {

    try {
const user = await User.findById(req.user.id)
        const records =
            await Attendance.find({
                memberId: user._id
            })
            .populate("parentId", "name")
            .sort({ date: -1 });


        res.json(records);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch attendance"
        });

    }

});


// ============================================
// MANAGER'S ATTENDANCE
// ============================================

router.get("/attendance", protect, async (req, res) => {

    try {
const user = await User.findById(req.user.id)
        if (
            user.role !== "manager" &&
            user.role !== "head"
        ) {

            return res.status(403).json({
                message: "Access denied"
            });

        }


        let query = {};


        // Manager only gets their members
        if (user.role === "manager") {

            query.parentId = user._id;

        }


        const records =
            await Attendance.find(query)
            .populate(
                "memberId",
                "name email year department"
            )
            .populate(
                "parentId",
                "name"
            )
            .sort({ date: -1 });


        res.json(records);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch attendance"
        });

    }

});


module.exports = router;