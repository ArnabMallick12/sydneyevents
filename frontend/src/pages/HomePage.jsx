import { useState, useEffect, useCallback } from 'react';
import { Loader2, Calendar, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';
import { eventsApi } from '../api';
import EventCard from '../components/EventCard';
import EventFilters from '../components/EventFilters';

export default function HomePage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sources, setSources] = useState([]);
    const [filters, setFilters] = useState({
        search: '',
        startDate: '',
        endDate: '',
        source: '',
        status: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
    });
    const [stats, setStats] = useState(null);

    // Fetch events
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
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
            setError('Failed to load events. Please try again.');
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.page, pagination.limit]);

    // Fetch sources and stats
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

    // Fetch events when filters or page changes
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Handle filter changes
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary-600/10 to-transparent" />
                <div className="container mx-auto px-4 relative">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span>Discover what's happening in Sydney</span>
                        </div>

                        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 text-balance">
                            Find Your Next{' '}
                            <span className="gradient-text">Amazing Event</span>
                        </h1>

                        <p className="text-lg text-dark-300 mb-8 max-w-xl mx-auto">
                            From live concerts to networking meetups, discover the best events happening in Sydney — all in one place.
                        </p>

                        {/* Quick Stats */}
                        {stats && (
                            <div className="flex items-center justify-center gap-8 text-sm">
                                <div className="flex items-center gap-2 text-dark-400">
                                    <Calendar className="w-4 h-4 text-primary-400" />
                                    <span><strong className="text-white">{stats.totalEvents || 0}</strong> Events</span>
                                </div>
                                <div className="flex items-center gap-2 text-dark-400">
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                    <span><strong className="text-white">{stats.statusCounts?.new || 0}</strong> New This Week</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="container mx-auto px-4 pb-20">
                {/* Filters */}
                <EventFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    sources={sources}
                />

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">Oops! Something went wrong</h3>
                        <p className="text-dark-400 mb-4">{error}</p>
                        <button onClick={fetchEvents} className="btn btn-primary">
                            Try Again
                        </button>
                    </div>
                )}

                {/* Events Grid */}
                {!loading && !error && (
                    <>
                        {events.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Calendar className="w-16 h-16 text-dark-600 mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">No events found</h3>
                                <p className="text-dark-400">Try adjusting your filters or check back later.</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {events.map((event) => (
                                        <EventCard key={event._id} event={event} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-12">
                                        <button
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            className="btn btn-secondary disabled:opacity-50"
                                        >
                                            Previous
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                                let pageNum;
                                                if (pagination.pages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (pagination.page <= 3) {
                                                    pageNum = i + 1;
                                                } else if (pagination.page >= pagination.pages - 2) {
                                                    pageNum = pagination.pages - 4 + i;
                                                } else {
                                                    pageNum = pagination.page - 2 + i;
                                                }

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className={`w-10 h-10 rounded-lg ${pagination.page === pageNum
                                                                ? 'bg-primary-500 text-white'
                                                                : 'btn-secondary'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page === pagination.pages}
                                            className="btn btn-secondary disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}
