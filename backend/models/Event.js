const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true
    },
    dateTime: {
        type: Date,
        required: true,
        index: true
    },
    venueName: {
        type: String,
        required: true
    },
    venueAddress: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: 'Sydney',
        index: true
    },
    shortDescription: {
        type: String,
        default: ''
    },
    category: {
        type: [String],
        default: []
    },
    imageUrl: {
        type: String,
        default: ''
    },
    sourceWebsiteName: {
        type: String,
        required: true,
        index: true
    },
    originalEventUrl: {
        type: String,
        required: true,
        unique: true
    },
    lastScrapedAt: {
        type: Date,
        default: Date.now
    },
    statusTag: {
        type: String,
        enum: ['new', 'updated', 'inactive', 'imported'],
        default: 'new',
        index: true
    },
    // Import tracking fields
    importedAt: {
        type: Date,
        default: null
    },
    importedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    importNotes: {
        type: String,
        default: ''
    },
    // Hash for change detection
    contentHash: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Compound indexes for efficient querying
eventSchema.index({ city: 1, dateTime: 1 });
eventSchema.index({ statusTag: 1, dateTime: 1 });
eventSchema.index({ title: 'text', shortDescription: 'text', venueName: 'text' });

module.exports = mongoose.model('Event', eventSchema);
