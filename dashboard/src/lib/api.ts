import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8081/api/dashboard',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getLogs = (page = 0, size = 20, serviceName?: string) => {
    return api.get('/logs', {
        params: {
            page,
            size,
            serviceName
        }
    });
}

export const getServices = () => {
    return api.get('/services');
}

export const getServiceMetadata = (serviceName: string) => {
    return api.get(`/services/${serviceName}`);
}

export const getAlerts = () => {
    return api.get('/alerts');
}

export const getStats = () => {
    return api.get('/stats');
}

export const resolveAlert = (id: string, resolvedBy: string) => {
    return api.post(`/alerts/${id}/resolve`, null, {
        params: { resolvedBy }
    });
}

export const updateRateLimit = (serviceName: string, limit: number) => {
    return api.post(`/services/${serviceName}/rate-limit`, null, {
        params: { limit }
    });
}

export default api;
