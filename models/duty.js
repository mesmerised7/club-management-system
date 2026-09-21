const mongoose = require("mongoose");

const dutySchema = new mongoose.Schema(
    {
        managerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        dutyName: {
            type: String,
            required: true,
            trim: true
        },

        date: {
            type: Date,
            required: true
        },

        secretCode: {
            type: String,
            required: true,
            unique: true
        },

        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Duty", dutySchema);