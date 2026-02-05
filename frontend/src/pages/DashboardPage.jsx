import { useState, useEffect, useCallback } from 'react';
import {
    LayoutDashboard,
    RefreshCw,
    Download,
    Filter,
    BarChart3
} from 'lucide-react';
import { eventsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import EventFilters from '../components/EventFilters';
import EventTable from '../components/EventTable';
import EventPreview from '../components/EventPreview';

export default function DashboardPage() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sources, setSources] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [importingId, setImportingId] = useState(null);
    const [showFilters, setShowFilters] = useState(true);

    const [filters, setFilters] = useState({
        search: '',
        startDate: '',
        endDate: '',
        source: '',
        status: ''
    });

    const [sortBy, setSortBy] = useState('dateTime');
    const [sortOrder, setSortOrder] = useState('asc');

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 25,
        total: 0,
        pages: 0
    });

    // Fetch events
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                sortBy,
                sortOrder,
                ...(filters.search && { search: filters.search }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate }),
                ...(filters.source && { source: filters.source }),
                ...(filters.status && { status: filters.status })
            };

            const response = await eventsApi.getAll(params);
            setEvents(response.data.events);
            setPagination(prev => ({ ...prev, ...response.data.pagination }));
        } catch (err) {
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.page, pagination.limit, sortBy, sortOrder]);

    // Fetch metadata
    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [sourcesRes, statsRes] = await Promise.all([
                    eventsApi.getSources(),
                    eventsApi.getStats()
                ]);
                setSources(sourcesRes.data || []);
                setStats(statsRes.data);
            } catch (err) {
                console.error('Error fetching metadata:', err);
            }
        };
        fetchMeta();
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Handle import
    const handleImport = async (eventId) => {
        setImportingId(eventId);
        try {
            await eventsApi.import(eventId);
            // Refresh events
            fetchEvents();
            // Update selected event if it's the one being imported
            if (selectedEvent?._id === eventId) {
                const updated = await eventsApi.getById(eventId);
                setSelectedEvent(updated.data);
            }
        } catch (err) {
            console.error('Error importing event:', err);
        } finally {
            setImportingId(null);
        }
    };

    // Handle filter change
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Handle sort
    const handleSort = (column, order) => {
        setSortBy(column);
        setSortOrder(order);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="border-b border-dark-800 bg-dark-900/50 backdrop-blur-sm sticky top-16 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary-500/10">
                                <LayoutDashboard className="w-5 h-5 text-primary-400" />
                            </div>
                            <div>
                                <h1 className="font-display text-xl font-semibold text-white">
                                    Event Dashboard
                                </h1>
                                <p className="text-sm text-dark-400">
                                    Welcome back, {user?.name?.split(' ')[0]}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`btn btn-ghost text-sm ${showFilters ? 'text-primary-400' : ''}`}
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                            </button>
                            <button
                                onClick={fetchEvents}
                                className="btn btn-secondary text-sm"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            {stats && (
                <div className="border-b border-dark-800 bg-dark-900/30">
                    <div className="container mx-auto px-4 py-3">
                        <div className="flex items-center gap-6 text-sm overflow-x-auto">
                            <div className="flex items-center gap-2 text-dark-400">
                                <BarChart3 className="w-4 h-4 text-primary-400" />
                                <span>Total: <strong className="text-white">{stats.totalEvents || 0}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="badge badge-new">New: {stats.statusCounts?.new || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="badge badge-updated">Updated: {stats.statusCounts?.updated || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="badge badge-imported">Imported: {stats.statusCounts?.imported || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="badge badge-inactive">Inactive: {stats.statusCounts?.inactive || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* Left Panel - Table */}
                <div className={`flex-1 flex flex-col min-w-0 ${selectedEvent ? 'border-r border-dark-800' : ''}`}>
                    {/* Filters */}
                    {showFilters && (
                        <div className="p-4 border-b border-dark-800">
                            <EventFilters
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                sources={sources}
                            />
                        </div>
                    )}

                    {/* Table */}
                    <div className="flex-1 overflow-auto">
                        <EventTable
                            events={events}
                            loading={loading}
                            onSelect={setSelectedEvent}
                            selectedId={selectedEvent?._id}
                            onImport={handleImport}
                            importingId={importingId}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSort={handleSort}
                        />
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="p-4 border-t border-dark-800 bg-dark-900/50">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-dark-400">
                                    Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="btn btn-secondary text-sm disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-dark-400">
                                        Page {pagination.page} of {pagination.pages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.pages}
                                        className="btn btn-secondary text-sm disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel - Preview */}
                {selectedEvent && (
                    <div className="w-96 flex-shrink-0">
                        <EventPreview
                            event={selectedEvent}
                            onClose={() => setSelectedEvent(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
