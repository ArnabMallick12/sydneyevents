import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true
});

// Events API
export const eventsApi = {
    getAll: (params = {}) => api.get('/events', { params }),
    getById: (id) => api.get(`/events/${id}`),
    getStats: () => api.get('/events/stats'),
    getSources: () => api.get('/events/sources/list'),
    import: (id, notes = '') => api.post(`/events/${id}/import`, { notes }),
    updateStatus: (id, status) => api.patch(`/events/${id}/status`, { status })
};

// Tickets API
export const ticketsApi = {
    create: (data) => api.post('/tickets', data),
    getAll: (params = {}) => api.get('/tickets', { params })
};

export default api;
