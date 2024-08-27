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
    const { user, message,role } = req.body;  // Expecting user info and message in the request body

    try {
        // Find the ticket by ID
        const ticket = await Ticket.findById(req.params.ticketId);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

        // Determine the new status based on the user sending the message
        let newStatus;
        if (req.body.role === 'admin' || req.body.role === 'superadmin') {
            newStatus = "در انتظار پاسخ";

        } else if (req.body.role === 'user') {

            newStatus ="در حال بررسی";
        } else {
            return res.status(400).json({ message: 'Invalid user role.' });
        }

        // Update the ticket's status in the database
        ticket.status = newStatus;
        ticket.updatedAt = new Date();  // Optionally update the 'updatedAt' timestamp
        await ticket.save();  // Save the ticket with the new status

        // Save the chat message to the chat collection
        const chatMessage = new Chat({
            ticketId: req.params.ticketId,
            user,  // Save the user who is making the chat
            message,
        });

        const savedMessage = await chatMessage.save();
        res.status(201).json({ message: 'Message sent and ticket status updated.', chat: savedMessage });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
module.exports = router;
