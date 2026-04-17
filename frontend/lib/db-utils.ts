import mockData from './mock-data.json';

const DATA_KEY = 'smarttutor_mock_db';

/**
 * Initialize or get data from localStorage
 */
export const getDb = () => {
    if (typeof window === 'undefined') return mockData;
    const stored = localStorage.getItem(DATA_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            return mockData;
        }
    }
    // Initialize with static mock data if empty
    localStorage.setItem(DATA_KEY, JSON.stringify(mockData));
    return mockData;
};

/**
 * Update localStorage with new data
 */
export const saveDb = (data: any) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(DATA_KEY, JSON.stringify(data));
    }
};

/**
 * Reset database to initial mock state
 */
export const resetDb = () => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(DATA_KEY, JSON.stringify(mockData));
    }
};
