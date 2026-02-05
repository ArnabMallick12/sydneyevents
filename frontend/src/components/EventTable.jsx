import { format } from 'date-fns';
import {
    ChevronUp,
    ChevronDown,
    ExternalLink,
    Check,
    Loader2
} from 'lucide-react';

export default function EventTable({
    events,
    loading,
    onSelect,
    selectedId,
    onImport,
    importingId,
    sortBy,
    sortOrder,
    onSort
}) {
    const handleSort = (column) => {
        if (sortBy === column) {
            onSort(column, sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            onSort(column, 'asc');
        }
    };

    const SortIcon = ({ column }) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc'
            ? <ChevronUp className="w-4 h-4" />
            : <ChevronDown className="w-4 h-4" />;
    };

    const formatDate = (date) => {
        try {
            return format(new Date(date), 'MMM d, yyyy');
        } catch {
            return '-';
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-dark-700">
                        <th
                            className="text-left py-3 px-4 font-medium text-dark-400 cursor-pointer hover:text-white transition-colors"
                            onClick={() => handleSort('title')}
                        >
                            <div className="flex items-center gap-1">
                                Event Title
                                <SortIcon column="title" />
                            </div>
                        </th>
                        <th
                            className="text-left py-3 px-4 font-medium text-dark-400 cursor-pointer hover:text-white transition-colors"
                            onClick={() => handleSort('dateTime')}
                        >
                            <div className="flex items-center gap-1">
                                Date
                                <SortIcon column="dateTime" />
                            </div>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-dark-400">
                            Venue
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-dark-400">
                            Source
                        </th>
                        <th
                            className="text-left py-3 px-4 font-medium text-dark-400 cursor-pointer hover:text-white transition-colors"
                            onClick={() => handleSort('statusTag')}
                        >
                            <div className="flex items-center gap-1">
                                Status
                                <SortIcon column="statusTag" />
                            </div>
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-dark-400">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {events.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="py-12 text-center text-dark-500">
                                No events found
                            </td>
                        </tr>
                    ) : (
                        events.map((event) => (
                            <tr
                                key={event._id}
                                onClick={() => onSelect(event)}
                                className={`border-b border-dark-800 cursor-pointer transition-colors ${selectedId === event._id
                                        ? 'bg-primary-500/10'
                                        : 'hover:bg-dark-800/50'
                                    }`}
                            >
                                <td className="py-3 px-4">
                                    <div className="font-medium text-white line-clamp-1 max-w-[300px]">
                                        {event.title}
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-dark-300">
                                    {formatDate(event.dateTime)}
                                </td>
                                <td className="py-3 px-4 text-dark-300">
                                    <span className="line-clamp-1 max-w-[150px]">
                                        {event.venueName}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-dark-400">
                                    {event.sourceWebsiteName}
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`badge ${getStatusBadge(event.statusTag)}`}>
                                        {event.statusTag}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {event.statusTag !== 'imported' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onImport(event._id);
                                                }}
                                                disabled={importingId === event._id}
                                                className="btn btn-primary text-xs py-1.5 px-3"
                                            >
                                                {importingId === event._id ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Check className="w-3 h-3" />
                                                        Import
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        <a
                                            href={event.originalEventUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="btn btn-ghost text-xs py-1.5 px-2 text-dark-400"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
