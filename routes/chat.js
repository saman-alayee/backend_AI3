const express = require('express');
const router = express.Router();
const {Chat} = require('../models/chat');
const { Ticket } = require('../models/ticket');

// Get all chat messages for a specific ticket
router.get('/:ticketId', async (req, res) => {
    try {
        const messages = await Chat.find({ ticketId: req.params.ticketId }).sort({ timestamp: 1 });
        if (!messages) return res.status(404).json({ message: 'No chat messages found for this ticket.' });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new chat message to a specific ticket
router.post('/:ticketId', async (req, res) => {
    const { user, message } = req.body;  // Expecting user info and message in the request body

    try {
        // Check if the ticket exists
        const ticket = await Ticket.findById(req.params.ticketId);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

        const chatMessage = new Chat({
            ticketId: req.params.ticketId,
            user,  // Save the user who is making the chat
            message,
        });

        const savedMessage = await chatMessage.save();
        res.status(201).json(savedMessage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
