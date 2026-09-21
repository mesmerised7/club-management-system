const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const User = require('./models/user'); // Path to your schema file
const bcrypt = require('bcrypt'); // Optional: If you hash passwords (highly recommended)
// const meetingRoutes = require("./routes/meetings");
const pointRoutes = require("./routes/points");
const  dns =  require("node:dns/promises");

dns.setServers(["1.1.1.1", "1.0.0.1"]);
const dutyRoutes = require("./routes/duty.js")
const ideaRoutes = require("./routes/ideas");
// const leaveRoutes = require("./routes/leave");
const port = 5000;
const app = express();
app.use(cors());
app.use(express.json());



async function initializeDatabase() {
    try {
        // 1. Check if a user with the role 'head' already exists
        const headExists = await User.findOne({ role: 'head' });

        if (headExists) {
            console.log('✔ Head user already exists. Skipping initialization.');
            return;
        }

        // Optional: Hash the password if you are using bcrypt
        // const hashedPassword = await bcrypt.hash('SuperSecurePassword123', 10);

        // 2. Create the default head user if none was found
         const hashpass = await bcrypt.hash("mega",10);
        const defaultHead = new User({
            name: "Default Head Admin",
            email: "head@company.com",
            status: "approved", // Set to approved so they can log in instantly
            password: hashpass, // Use hashedPassword here if using bcrypt
            role: "head",
            department: "Administration",
            year: new Date().getFullYear()
        });

        await defaultHead.save();
        console.log('🚀 Default Head user initialized successfully!');

    } catch (error) {
        console.error('❌ Error during DB initialization:', error);
    }
}

console.log("mongo_uri",process.env.MONGO_URI)
const connect_mongo=async()=>{ await mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("Mongodb connected");
    initializeDatabase()

}).catch(err=> console.log(err));}
connect_mongo()
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/duties", dutyRoutes);
app.use("/api/ideas", ideaRoutes);
// app.use("/api/meetings", meetingRoutes);
app.use("/api/points", pointRoutes);
// app.use("/api/leave", leaveRoutes);
app.get("/",(req,res)=>{
    res.status(200).json({
        message: "club management API running"
    });
    
    
})
app.listen(port, ()=>{
    console.log("server running on port: ",port)
})