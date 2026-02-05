import { format } from 'date-fns';
import {
    X,
    Calendar,
    MapPin,
    Tag,
    ExternalLink,
    Clock,
    User,
    FileText
} from 'lucide-react';

export default function EventPreview({ event, onClose }) {
    if (!event) return null;

    const formatDate = (date) => {
        try {
            return format(new Date(date), 'EEEE, MMMM d, yyyy • h:mm a');
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
        <div className="h-full bg-dark-900 border-l border-dark-800 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-800">
                <h3 className="font-medium text-white">Event Details</h3>
                <button
                    onClick={onClose}
                    className="p-1 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
                {/* Image */}
                {event.imageUrl && (
                    <div className="rounded-xl overflow-hidden aspect-video bg-dark-800">
                        <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    </div>
                )}

                {/* Title & Status */}
                <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <h2 className="font-display text-xl font-semibold text-white">
                            {event.title}
                        </h2>
                        <span className={`badge ${getStatusBadge(event.statusTag)} flex-shrink-0`}>
                            {event.statusTag}
                        </span>
                    </div>
                    <span className="text-sm text-dark-400">{event.sourceWebsiteName}</span>
                </div>

                {/* Details */}
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="text-white">{formatDate(event.dateTime)}</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="text-white">{event.venueName}</div>
                            {event.venueAddress && (
                                <div className="text-sm text-dark-400">{event.venueAddress}</div>
                            )}
                        </div>
                    </div>

                    {event.category && event.category.length > 0 && (
                        <div className="flex items-start gap-3">
                            <Tag className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                            <div className="flex flex-wrap gap-2">
                                {event.category.map((cat, idx) => (
                                    <span
                                        key={idx}
                                        className="text-xs bg-dark-800 text-dark-300 px-2 py-1 rounded-md"
                                    >
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Description */}
                {event.shortDescription && (
                    <div>
                        <h4 className="text-sm font-medium text-dark-400 mb-2">Description</h4>
                        <p className="text-dark-300 text-sm leading-relaxed">
                            {event.shortDescription}
                        </p>
                    </div>
                )}

                {/* Import Info */}
                {event.statusTag === 'imported' && (
                    <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                        <h4 className="text-sm font-medium text-primary-400 mb-3">Import Details</h4>
                        <div className="space-y-2 text-sm">
                            {event.importedAt && (
                                <div className="flex items-center gap-2 text-dark-300">
                                    <Clock className="w-4 h-4 text-dark-500" />
                                    <span>Imported {format(new Date(event.importedAt), 'MMM d, yyyy')}</span>
                                </div>
                            )}
                            {event.importNotes && (
                                <div className="flex items-start gap-2 text-dark-300">
                                    <FileText className="w-4 h-4 text-dark-500 mt-0.5" />
                                    <span>{event.importNotes}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Meta */}
                <div className="pt-4 border-t border-dark-800">
                    <h4 className="text-sm font-medium text-dark-400 mb-3">Metadata</h4>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-dark-500">Event ID</span>
                            <span className="text-dark-400 font-mono">{event._id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-dark-500">Last Scraped</span>
                            <span className="text-dark-400">
                                {event.lastScrapedAt
                                    ? format(new Date(event.lastScrapedAt), 'MMM d, yyyy HH:mm')
                                    : '-'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-dark-800">
                <a
                    href={event.originalEventUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary w-full"
                >
                    <span>View Original</span>
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
}
