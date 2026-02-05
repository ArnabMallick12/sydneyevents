import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, MapPin, ExternalLink, Tag } from 'lucide-react';
import TicketModal from './TicketModal';

export default function EventCard({ event }) {
    const [showModal, setShowModal] = useState(false);

    const formatDate = (date) => {
        try {
            return format(new Date(date), 'EEE, MMM d • h:mm a');
        } catch {
            return 'Date TBA';
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            new: 'badge-new',
            updated: 'badge-updated',
            inactive: 'badge-inactive',
            imported: 'badge-imported'
        };
        return badges[status] || 'badge-new';
    };

    return (
        <>
            <article className="card card-hover overflow-hidden group">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                    {event.imageUrl ? (
                        <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div
                        className={`w-full h-full bg-gradient-to-br from-primary-600/20 to-accent-600/20 items-center justify-center ${event.imageUrl ? 'hidden' : 'flex'}`}
                    >
                        <Calendar className="w-12 h-12 text-dark-500" />
                    </div>

                    {/* Source badge */}
                    <div className="absolute top-3 left-3">
                        <span className="badge bg-dark-900/80 backdrop-blur-sm text-dark-200 border border-dark-700">
                            {event.sourceWebsiteName}
                        </span>
                    </div>

                    {/* Status badge */}
                    {event.statusTag && (
                        <div className="absolute top-3 right-3">
                            <span className={`badge ${getStatusBadge(event.statusTag)}`}>
                                {event.statusTag}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-primary-400 text-sm mb-2">
                        <Calendar className="w-4 h-4" />
                        <time>{formatDate(event.dateTime)}</time>
                    </div>

                    {/* Title */}
                    <h3 className="font-display font-semibold text-lg text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
                        {event.title}
                    </h3>

                    {/* Venue */}
                    <div className="flex items-start gap-2 text-dark-400 text-sm mb-3">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{event.venueName}</span>
                    </div>

                    {/* Description */}
                    <p className="text-dark-400 text-sm line-clamp-2 mb-4">
                        {event.shortDescription || 'Discover this exciting event in Sydney!'}
                    </p>

                    {/* Categories */}
                    {event.category && event.category.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {event.category.slice(0, 3).map((cat, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 text-xs text-dark-400 bg-dark-800/50 px-2 py-1 rounded-md"
                                >
                                    <Tag className="w-3 h-3" />
                                    {cat}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* CTA Button */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn btn-primary w-full text-sm group/btn"
                    >
                        <span>Get Tickets</span>
                        <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </button>
                </div>
            </article>

            {/* Ticket Modal */}
            <TicketModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                event={event}
            />
        </>
    );
}
