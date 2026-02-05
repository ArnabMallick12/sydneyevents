/**
 * Seed script to populate demo events for testing
 * Usage: node scripts/seedEvents.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');

const demoEvents = [
    {
        title: "Sydney Symphony Orchestra: Beethoven's 9th",
        dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        venueName: "Sydney Opera House",
        venueAddress: "Bennelong Point, Sydney NSW 2000",
        city: "Sydney",
        shortDescription: "Experience the power of Beethoven's triumphant final symphony performed by the Sydney Symphony Orchestra in the iconic Concert Hall.",
        category: ["Music", "Classical"],
        imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",
        sourceWebsiteName: "Demo Events",
        originalEventUrl: "https://www.sydneysymphony.com/",
        statusTag: "new"
    },
    {
        title: "Vivid Sydney 2026 - Light Festival",
        dateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        venueName: "Circular Quay",
        venueAddress: "Circular Quay, Sydney NSW 2000",
        city: "Sydney",
        shortDescription: "The world's largest festival of light, music and ideas transforms Sydney with stunning light installations and projections.",
        category: ["Festival", "Art", "Music"],
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        sourceWebsiteName: "Demo Events",
        originalEventUrl: "https://www.vividsydney.com/",
        statusTag: "new"
    },
    {
        title: "Sydney Comedy Festival Gala",
        dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        venueName: "Enmore Theatre",
        venueAddress: "118-132 Enmore Rd, Newtown NSW 2042",
        city: "Sydney",
        shortDescription: "Laugh until it hurts at the annual Comedy Festival Gala featuring Australia's best comedians and international stars.",
        category: ["Comedy", "Entertainment"],
        imageUrl: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800",
        sourceWebsiteName: "Demo Events",
        originalEventUrl: "https://www.sydneycomedyfest.com.au/",
        statusTag: "new"
    },
    {
        title: "Tech Meetup Sydney: AI & Machine Learning",
        dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        venueName: "Fishburners",
        venueAddress: "11 York St, Sydney NSW 2000",
        city: "Sydney",
        shortDescription: "Join fellow developers and AI enthusiasts for talks, networking, and hands-on workshops on the latest in AI and ML.",
        category: ["Technology", "Networking", "Meetup"],
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
        sourceWebsiteName: "Demo Events",
        originalEventUrl: "https://www.meetup.com/",
        statusTag: "new"
    },
    {
        title: "Bondi Beach Sunset Yoga",
        dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        venueName: "Bondi Beach",
        venueAddress: "Queen Elizabeth Dr, Bondi Beach NSW 2026",
        city: "Sydney",
        shortDescription: "Unwind with a relaxing yoga session on the sand as the sun sets over the Pacific Ocean. All levels welcome.",
        category: ["Fitness", "Wellness", "Outdoor"],
        imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
        sourceWebsiteName: "Demo Events",
        originalEventUrl: "https://bondiyoga.com.au/",
        statusTag: "updated"
    },
    {
        title: "Sydney Food & Wine Festival",
        dateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        venueName: "The Rocks",
        venueAddress: "The Rocks, Sydney NSW 2000",
        city: "Sydney",
        shortDescription: "Indulge in a culinary journey featuring Sydney's top chefs, local wineries, and artisan producers.",
        category: ["Food & Drink", "Festival"],
        imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800",
        sourceWebsiteName: "Demo Events",
        originalEventUrl: "https://www.sydney.com/",
        statusTag: "new"
    },
    {
        title: "Australian Open Tennis - Sydney Sessions",
        dateTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        venueName: "Ken Rosewall Arena",
        venueAddress: "Olympic Blvd, Sydney Olympic Park NSW 2127",
        city: "Sydney",
        shortDescription: "Watch world-class tennis action at the Sydney International featuring ATP and WTA stars.",
        category: ["Sports", "Tennis"],
        imageUrl: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800",
        sourceWebsiteName: "Demo Events",
        originalEventUrl: "https://www.tennis.com.au/",
        statusTag: "new"
    },
    {
        title: "Midnight Oil - Final Tour",
        dateTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        venueName: "Qudos Bank Arena",
        venueAddress: "Edwin Flack Ave, Sydney Olympic Park NSW 2127",
        city: "Sydney",
        shortDescription: "Don't miss the legendary Australian rock band's farewell tour. A once-in-a-lifetime concert experience.",
        category: ["Music", "Rock", "Concert"],
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
        sourceWebsiteName: "Demo Events",
        originalEventUrl: "https://www.ticketmaster.com.au/",
        statusTag: "imported"
    },
    {
        title: "Sydney Harbour Bridge Climb Experience",
        dateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        venueName: "Sydney Harbour Bridge",
        venueAddress: "3 Cumberland St, The Rocks NSW 2000",
        city: "Sydney",
        shortDescription: "Scale the iconic Sydney Harbour Bridge for breathtaking 360-degree views of the city and harbour.",
        category: ["Adventure", "Tourism", "Outdoor"],
        imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800",
        sourceWebsiteName: "Demo Events",
        originalEventUrl: "https://www.bridgeclimb.com/",
        statusTag: "new"
    },
    {
        title: "Startup Pitch Night Sydney",
        dateTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        venueName: "Stone & Chalk",
        venueAddress: "Level 4, 11 York St, Sydney NSW 2000",
        city: "Sydney",
        shortDescription: "Watch Sydney's hottest startups pitch to investors and vote for your favorite in this exciting competition.",
        category: ["Business", "Networking", "Startup"],
        imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800",
        sourceWebsiteName: "Demo Events",
        originalEventUrl: "https://www.stoneandchalk.com.au/",
        statusTag: "new"
    },
    {
        title: "Sydney Film Festival - Opening Night",
        dateTime: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        venueName: "State Theatre",
        venueAddress: "49 Market St, Sydney NSW 2000",
        city: "Sydney",
        shortDescription: "Join us for the red carpet premiere of this year's most anticipated films at the historic State Theatre.",
        category: ["Film", "Arts", "Festival"],
        imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
        sourceWebsiteName: "Demo Events",
        originalEventUrl: "https://www.sff.org.au/",
        statusTag: "new"
    },
    {
        title: "Art After Hours - Museum of Contemporary Art",
        dateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        venueName: "Museum of Contemporary Art",
        venueAddress: "140 George St, The Rocks NSW 2000",
        city: "Sydney",
        shortDescription: "Explore the museum after dark with special exhibitions, live performances, and drinks at the rooftop bar.",
        category: ["Art", "Culture", "Nightlife"],
        imageUrl: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800",
        sourceWebsiteName: "Demo Events",
        originalEventUrl: "https://www.mca.com.au/",
        statusTag: "updated"
    }
];

async function seedEvents() {
    console.log('🌱 Seeding demo events...');

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing demo events
        await Event.deleteMany({ sourceWebsiteName: 'Demo Events' });
        console.log('🗑️  Cleared existing demo events');

        // Insert demo events
        const result = await Event.insertMany(demoEvents.map(event => ({
            ...event,
            lastScrapedAt: new Date(),
            contentHash: require('crypto').createHash('md5').update(event.title).digest('hex')
        })));

        console.log(`✅ Seeded ${result.length} demo events`);
        console.log('\n📋 Events created:');
        result.forEach(e => console.log(`   - ${e.title}`));

    } catch (error) {
        console.error('❌ Error seeding events:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

seedEvents();
