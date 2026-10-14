const express = require("express");
const bcrypt = require("bcrypt")
const User = require("../models/user");
const auth = require("../middleware/auth");

const router = express.Router();

// {"name":"gurkirat singh","email":"gurkirat@gmail.com","role":"manager","year":2,"department":"IT","password":"guri"}
// Get my profile
router.get("/me", auth, async (req, res) => {

    const user = await User.findById(req.user._id)
        .select("-password");

    res.json(user);
});

router.patch("/:id/approve", auth, async (req, res) => {
    
    try {
        const user = await User.findById(req.user.id)
        .select("-password");
        console.log(user);
        if (
            user.role !== "head" &&
            user.role !== "manager"
        ) {
            return res.status(403).json({
                message: "Access denied"
            });
        }


        const member = await User.findById(
            req.params.id
        );


        if (!member) {
            return res.status(404).json({
                message: "Member not found"
            });
        }


        if (member.role !== "member") {
            return res.status(400).json({
                message: "Invalid member"
            });
        }


        // Manager can only approve their own members

        if (
            user.role === "manager" &&
            member.parentId?.toString() !==
            user._id.toString()
        ) {
            return res.status(403).json({
                message: "You cannot approve this member"
            });
        }


        member.status = "approved";

        await member.save();


        res.json({
            message: "Member approved",
            member
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to approve member"
        });

    }

});
router.patch("/:id/reject", auth, async (req, res) => {

    try {
        const user = await User.findById(req.user.id)
        .select("-password");

        if (
            user.role !== "head" &&
            user.role !== "manager"
        ) {
            return res.status(403).json({
                message: "Access denied"
            });
        }


        const member = await User.findById(
            req.params.id
        );


        if (!member) {
            return res.status(404).json({
                message: "Member not found"
            });
        }


        if (
            user.role === "manager" &&
            member.parentId?.toString() !==
            user._id.toString()
        ) {
            return res.status(403).json({
                message: "You cannot reject this member"
            });
        }


        member.status = "rejected";

        await member.save();


        res.json({
            message: "Member rejected"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to reject member"
        });

    }

});


router.get("/pending", auth, async (req, res) => {

    try {

        // Only head or manager
        console.log(req.user)
        console.log(req.user.id)
        const user = await User.findById(req.user.id)
        .select("-password");
        if (
            user.role !== "head" &&
            user.role !== "manager"
        ) {
            return res.status(403).json({
                message: "Access denied"
            });
        }


        let query = {
            role: "member",
            status: "pending"
        };


        // Manager sees only their own requests

        if (user.role === "manager") {

            query.parentId = user._id;

        }


        const members = await User.find(query)
            .select("-password")
            .populate("parentId", "name");


        res.json(members);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch requests"
        });

    }

});
router.get("/managers", async (req, res) => {

    try {

        const managers = await User.find({
            role: "manager",
            status: "approved"
        }).select("_id name");

        res.json(managers);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch managers"
        });

    }

});
// Get direct children
router.get("/children", auth, async (req, res) => {
    const user = await User.findById(req.user.id).select("-password")
    if (user.role=="head" || user.role == "manager"){
         const children = await User.find({
        parentId: req.user.id
    }).select("-password");
    res.json(children);
    }else{
         const children = await User.find({
        parentId: user.parentId
    }).select("-password");
    res.json(children);

    }
    
});

router.get("/all",async(req,res)=>{
     try {
        
        const allUsers = await User.find({}).select("-password"); 
        
        res.status(200).json(allUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})
// Add manager/member
router.post("/add", auth, async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            role,
            year,
            department
        } = req.body;

        const currentUser = await User.findById(req.user.id);

        // HEAD can create managers
        if (
            currentUser.role === "head" &&
            role !== "manager"
        ) {
            return res.status(403).json({
                message: "Head can only add managers"
            });
        }

        // MANAGER can create members
        if (
            currentUser.role === "manager" &&
            role !== "member"
        ) {
            return res.status(403).json({
                message: "Manager can only add members"
            });
        }

        if (currentUser.role === "member") {
            return res.status(403).json({
                message: "Members cannot add users"
            });
        }

        const existing = await User.findOne({ email });

        if (existing) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

       

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            parentId: currentUser._id,
            year,
            department
        });

        res.status(201).json({
            message: "User added",
            userId: user._id
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});

module.exports = router;
