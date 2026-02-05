const mongoose = require('mongoose');

const ticketRequestSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true
    },
    consent: {
        type: Boolean,
        required: true,
        default: false
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for analytics
ticketRequestSchema.index({ eventId: 1, timestamp: -1 });

module.exports = mongoose.model('TicketRequest', ticketRequestSchema);
