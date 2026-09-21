const express = require("express");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/user");
const router = express.Router();
// {"msg":"login successful","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWE1OTQ5ZjcwMGExMDMzYzQ2OTk1ODciLCJyb2xlIjoiaGVhZCIsImlhdCI6MTc4OTIzNjUyOSwiZXhwIjoxNzg5ODQxMzI5fQ.6NpPrKisabKK3sKaMcw7xDdFZE6imQBPIhLqlJKq7As","user":{"id":"6aa5949f700a1033c4699587","name":"king","role":"head"}}
router.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            managerId,
            year,
            department
        } = req.body;


        // Check required fields

        if (
            !name ||
            !email ||
            !password ||
            !managerId
        ) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }


        // Check existing user

        const existingUser = await User.findOne({
            email
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }


        // Check manager

        const manager = await User.findOne({
            _id: managerId,
            role: "manager",
            status: "approved"
        });

        if (!manager) {
            return res.status(400).json({
                message: "Invalid manager selected"
            });
        }


        // Hash password

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // Create member

        const user = await User.create({

            name,
            email,
            password: hashedPassword,

            role: "member",

            parentId: manager._id,

            status: "pending",

            year,
            department,

            credit: 0

        });


        res.status(201).json({

            message:
                "Registration successful. Wait for manager approval.",

            userId: user._id

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

});
router.post("/signup",async (req,res)=>{
    try{
        const {
            name,
            email,
            password,
            role,
            parentId,
            year,
            department
        } = req.body;
        const existingUser = await User.findOne({email});
        if (existingUser){
            return res.status(400).json({msg:"user already exists"});

        }
        const hashpass = await bcrypt.hash(password,10);
        const user = await User.create({
            name,
            email,
            password: hashpass,
            role,
            parentId,
            year,
            department
        });
        res.status(201).json({
            msg:"user created",
            userId:user._id
        });
    } catch(error){
        res.status(500).json({
            msg:error.message
        })
    }
})
router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({
            email
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }


        // Check password

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }


        // Check account status

        if (user.status === "pending") {

            return res.status(403).json({
                message:
                    "Your account is waiting for manager approval."
            });

        }


        if (user.status === "rejected") {

            return res.status(403).json({
                message:
                    "Your registration was rejected."
            });

        }


        // Create token

        const token = jwt.sign(
            {
                id: user._id
            },
            "mega",
            {
                expiresIn: "7d"
            }
        );
        const s_user=await User.findById(user._id).select("-password");

        res.json({

            token,

            user: s_user

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

});

module.exports=router;