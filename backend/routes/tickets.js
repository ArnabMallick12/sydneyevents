const express = require('express');
const TicketRequest = require('../models/TicketRequest');
const Event = require('../models/Event');
const router = express.Router();

// POST /api/tickets - Create ticket request
router.post('/', async (req, res) => {
    try {
        const { email, consent, eventId } = req.body;

        // Validate input
        if (!email || !eventId) {
            return res.status(400).json({ error: 'Email and eventId are required' });
        }

        if (!consent) {
            return res.status(400).json({ error: 'Consent is required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Create ticket request
        const ticketRequest = await TicketRequest.create({
            email,
            consent,
            eventId,
            timestamp: new Date()
        });

        res.status(201).json({
            success: true,
            ticketRequest,
            redirectUrl: event.originalEventUrl
        });
    } catch (err) {
        console.error('Error creating ticket request:', err);
        res.status(500).json({ error: 'Failed to create ticket request' });
    }
});

// GET /api/tickets - Get all ticket requests (authenticated)
router.get('/', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const { eventId, page = 1, limit = 50 } = req.query;
        const query = eventId ? { eventId } : {};
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [requests, total] = await Promise.all([
            TicketRequest.find(query)
                .populate('eventId', 'title')
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            TicketRequest.countDocuments(query)
        ]);

        res.json({
            requests,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Error fetching ticket requests:', err);
        res.status(500).json({ error: 'Failed to fetch ticket requests' });
    }
});

module.exports = router;
