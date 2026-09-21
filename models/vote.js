const mongoose = require("mongoose");

const ideaVoteSchema = new mongoose.Schema(
    {
        ideaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Idea",
            required: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        vote: {
            type: String,
            enum: ["like", "dislike"],
            required: true
        }
    },
    {
        timestamps: true
    }
);


// One user can have only one vote on one idea
ideaVoteSchema.index(
    {
        ideaId: 1,
        userId: 1
    },
    {
        unique: true
    }
);


module.exports = mongoose.model("IdeaVote", ideaVoteSchema);