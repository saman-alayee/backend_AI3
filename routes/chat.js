const express = require('express');
const router = express.Router();
const { Chat, validateChat, upload } = require("../models/chat");  
const { Ticket } = require('../models/ticket');
const sendNotification = require("../utils/sendNotification");
const multer = require("multer"); 
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
router.post('/:ticketId', upload.array('images'), async (req, res) => {
    const { user, message, role } = req.body;
  
    // Validate chat input
    // const { error } = validateChat(req.body);
    // if (error) return res.status(400).json({ message: error.details[0].message });
  
    // Handle file uploads
    const uploadedFiles = req.files;
    const attachmentFileUrls = uploadedFiles?.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`) || [];
  
    try {
      // Find the ticket by ID
      const ticket = await Ticket.findById(req.params.ticketId);
      if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });
  
      // Determine the new status based on the user role
      let newStatus;
      if (role === 'admin' || role === 'superadmin') {
        newStatus = "در انتظار پاسخ";
        await sendNotification(ticket);  // Notify admin role
      } else if (role === 'user' || role === 'child') {
        newStatus = "در حال بررسی";
      } else {
        return res.status(400).json({ message: 'Invalid user role.' });
      }
  
      // Update the ticket's status
      ticket.status = newStatus;
      ticket.updatedAt = new Date(); // Optionally update the 'updatedAt' timestamp
      await ticket.save();
  
      // Save the chat message to the chat collection
      const chatMessage = new Chat({
        ticketId: req.params.ticketId,
        user,  
        message,
        attachmentFiles: attachmentFileUrls,  // Save file URLs
        role
      });
  
      const savedMessage = await chatMessage.save();
      res.status(201).json({ message: 'Message sent and ticket status updated.', chat: savedMessage });
    } catch (err) {
      console.error("Error saving the chat message:", err);
      res.status(500).json({ message: err.message });
    }
  });
module.exports = router;
