import { Search, Calendar, X } from 'lucide-react';

export default function EventFilters({
    filters,
    onFilterChange,
    sources = []
}) {
    const handleChange = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        onFilterChange({
            search: '',
            startDate: '',
            endDate: '',
            source: '',
            status: ''
        });
    };

    const hasActiveFilters = filters.search || filters.startDate || filters.endDate || filters.source || filters.status;

    return (
        <div className="glass rounded-2xl p-4 mb-8">
            <div className="flex flex-wrap gap-4">
                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={filters.search || ''}
                            onChange={(e) => handleChange('search', e.target.value)}
                            className="input pl-10 py-2.5"
                        />
                    </div>
                </div>

                {/* Date Range */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                        <input
                            type="date"
                            value={filters.startDate || ''}
                            onChange={(e) => handleChange('startDate', e.target.value)}
                            className="input pl-10 py-2.5 w-40"
                        />
                    </div>
                    <span className="text-dark-500">to</span>
                    <input
                        type="date"
                        value={filters.endDate || ''}
                        onChange={(e) => handleChange('endDate', e.target.value)}
                        className="input py-2.5 w-40"
                    />
                </div>

                {/* Source Filter */}
                <select
                    value={filters.source || ''}
                    onChange={(e) => handleChange('source', e.target.value)}
                    className="input py-2.5 w-40"
                >
                    <option value="">All Sources</option>
                    {sources.map((source) => (
                        <option key={source} value={source}>{source}</option>
                    ))}
                </select>

                {/* Status Filter */}
                <select
                    value={filters.status || ''}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="input py-2.5 w-36"
                >
                    <option value="">All Status</option>
                    <option value="new">New</option>
                    <option value="updated">Updated</option>
                    <option value="imported">Imported</option>
                    <option value="inactive">Inactive</option>
                </select>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="btn btn-ghost text-sm text-dark-400"
                    >
                        <X className="w-4 h-4" />
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}
