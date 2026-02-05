const express = require('express');
const Event = require('../models/Event');
const router = express.Router();

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Authentication required' });
};

// GET /api/events - Get all events with filters
router.get('/', async (req, res) => {
    try {
        const {
            city = 'Sydney',
            search,
            startDate,
            endDate,
            status,
            source,
            category,
            page = 1,
            limit = 20,
            sortBy = 'dateTime',
            sortOrder = 'asc'
        } = req.query;

        // Build query
        const query = { city };

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        // Date range filter
        if (startDate || endDate) {
            query.dateTime = {};
            if (startDate) {
                query.dateTime.$gte = new Date(startDate);
            }
            if (endDate) {
                query.dateTime.$lte = new Date(endDate);
            }
        }

        // Status filter
        if (status) {
            query.statusTag = status;
        }

        // Source filter
        if (source) {
            query.sourceWebsiteName = source;
        }

        // Category filter
        if (category) {
            query.category = { $in: category.split(',') };
        }

        // Exclude inactive for public view
        if (!req.isAuthenticated()) {
            query.statusTag = { $ne: 'inactive' };
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        // Execute query
        const [events, total] = await Promise.all([
            Event.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Event.countDocuments(query)
        ]);

        res.json({
            events,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// GET /api/events/stats - Get event statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await Event.aggregate([
            {
                $group: {
                    _id: '$statusTag',
                    count: { $sum: 1 }
                }
            }
        ]);

        const sources = await Event.aggregate([
            {
                $group: {
                    _id: '$sourceWebsiteName',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            statusCounts: stats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
            sourceCounts: sources.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
            totalEvents: await Event.countDocuments()
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// GET /api/events/:id - Get single event
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).lean();
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(event);
    } catch (err) {
        console.error('Error fetching event:', err);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
});

// POST /api/events/:id/import - Import event (authenticated)
router.post('/:id/import', isAuthenticated, async (req, res) => {
    try {
        const { notes } = req.body;

        const event = await Event.findByIdAndUpdate(
            req.params.id,
            {
                statusTag: 'imported',
                importedAt: new Date(),
                importedBy: req.user._id,
                importNotes: notes || ''
            },
            { new: true }
        );

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json({ success: true, event });
    } catch (err) {
        console.error('Error importing event:', err);
        res.status(500).json({ error: 'Failed to import event' });
    }
});

// PATCH /api/events/:id/status - Update event status (authenticated)
router.patch('/:id/status', isAuthenticated, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['new', 'updated', 'inactive', 'imported'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { statusTag: status },
            { new: true }
        );

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json({ success: true, event });
    } catch (err) {
        console.error('Error updating status:', err);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// GET /api/events/sources/list - Get unique sources
router.get('/sources/list', async (req, res) => {
    try {
        const sources = await Event.distinct('sourceWebsiteName');
        res.json(sources);
    } catch (err) {
        console.error('Error fetching sources:', err);
        res.status(500).json({ error: 'Failed to fetch sources' });
    }
});

module.exports = router;
