const mongoose = require("mongoose");

const ideaSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },

        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        authorName: {
            type: String,
            required: true
        },

        authorRole: {
            type: String,
            enum: ["head", "manager", "member"],
            required: true
        },

        likes: {
            type: Number,
            default: 0
        },

        dislikes: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Idea", ideaSchema);