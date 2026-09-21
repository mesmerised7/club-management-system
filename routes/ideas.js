const express = require("express");

const Idea = require("../models/ideas");
const IdeaVote = require("../models/vote");
const protect = require("../middleware/auth");
const User = require("../models/user")
const router = express.Router();


// =====================================================
// GET ALL IDEAS
// =====================================================

router.get("/", protect, async (req, res) => {

    try {
const user = await User.findById(req.user.id)
        const ideas = await Idea.find()
            .sort({ createdAt: -1 });


        // Get this user's votes
        const userVotes = await IdeaVote.find({
            userId: user._id
        });


        // Convert votes into easy lookup
        const voteMap = {};

        userVotes.forEach(vote => {

            voteMap[vote.ideaId.toString()] = vote.vote;

        });


        const result = ideas.map(idea => ({

            _id: idea._id,

            title: idea.title,

            description: idea.description,

            authorName: idea.authorName,

            authorRole: idea.authorRole,

            likes: idea.likes,

            dislikes: idea.dislikes,

            createdAt: idea.createdAt,

            // This tells the current user
            // what they personally selected.
            // It does NOT expose other voters.
            myVote:
                voteMap[idea._id.toString()] || null

        }));


        res.json(result);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch ideas"
        });

    }

});


// =====================================================
// CREATE IDEA
// =====================================================

router.post("/", protect, async (req, res) => {

    try {
const user = await User.findById(req.user.id)
        const {
            title,
            description
        } = req.body;


        if (!title || !description) {

            return res.status(400).json({
                message: "Title and description are required"
            });

        }


        const idea = await Idea.create({

            title: title.trim(),

            description: description.trim(),

            authorId: user._id,

            authorName: user.name,

            authorRole: user.role,

            likes: 0,

            dislikes: 0

        });


        res.status(201).json({

            message: "Idea posted successfully",

            idea

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to create idea"
        });

    }

});


// =====================================================
// VOTE ON IDEA
// =====================================================

router.post("/:id/vote", protect, async (req, res) => {

    try {
const user = await User.findById(req.user.id)
        const {
            vote
        } = req.body;


        if (
            vote !== "like" &&
            vote !== "dislike"
        ) {

            return res.status(400).json({
                message: "Invalid vote"
            });

        }


        const idea = await Idea.findById(req.params.id);


        if (!idea) {

            return res.status(404).json({
                message: "Idea not found"
            });

        }


        // Check existing vote
        const existingVote =
            await IdeaVote.findOne({

                ideaId: idea._id,

                userId: user._id

            });


        // =================================================
        // NO EXISTING VOTE
        // =================================================

        if (!existingVote) {

            await IdeaVote.create({

                ideaId: idea._id,

                userId: user._id,

                vote

            });


            if (vote === "like") {

                idea.likes += 1;

            } else {

                idea.dislikes += 1;

            }


            await idea.save();


            return res.json({

                message: "Vote recorded",

                likes: idea.likes,

                dislikes: idea.dislikes,

                myVote: vote

            });

        }


        // =================================================
        // SAME VOTE → REMOVE VOTE
        // =================================================

        if (existingVote.vote === vote) {

            await IdeaVote.deleteOne({
                _id: existingVote._id
            });


            if (vote === "like") {

                idea.likes = Math.max(
                    0,
                    idea.likes - 1
                );

            } else {

                idea.dislikes = Math.max(
                    0,
                    idea.dislikes - 1
                );

            }


            await idea.save();


            return res.json({

                message: "Vote removed",

                likes: idea.likes,

                dislikes: idea.dislikes,

                myVote: null

            });

        }


        // =================================================
        // CHANGING LIKE → DISLIKE
        // OR DISLIKE → LIKE
        // =================================================

        const oldVote = existingVote.vote;

        existingVote.vote = vote;

        await existingVote.save();


        if (oldVote === "like") {

            idea.likes = Math.max(
                0,
                idea.likes - 1
            );

            idea.dislikes += 1;

        } else {

            idea.dislikes = Math.max(
                0,
                idea.dislikes - 1
            );

            idea.likes += 1;

        }


        await idea.save();


        res.json({

            message: "Vote updated",

            likes: idea.likes,

            dislikes: idea.dislikes,

            myVote: vote

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to process vote"
        });

    }

});


// =====================================================
// DELETE OWN IDEA
// =====================================================

router.delete("/:id", protect, async (req, res) => {

    try {
const user = await User.findById(req.user.id)
        const idea =
            await Idea.findById(req.params.id);


        if (!idea) {

            return res.status(404).json({
                message: "Idea not found"
            });

        }


        // Only author or head can delete
        if (
            idea.authorId.toString() !==
            user._id.toString() &&
            user.role !== "head"
        ) {

            return res.status(403).json({
                message: "You cannot delete this idea"
            });

        }


        await IdeaVote.deleteMany({
            ideaId: idea._id
        });


        await Idea.deleteOne({
            _id: idea._id
        });


        res.json({
            message: "Idea deleted"
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to delete idea"
        });

    }

});


module.exports = router;