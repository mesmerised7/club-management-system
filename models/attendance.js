const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        duty: {
            type: String,
            required: true,
            trim: true
        },

        secretCode: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["present"],
            default: "present"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Attendance", attendanceSchema);