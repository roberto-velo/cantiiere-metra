
import type { Client, Technician, Task, TaskStatus, Reminder } from './types';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, isValid, startOfYear, endOfYear, startOfDay, endOfDay } from 'date-fns';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9002';

async function fetchData<T>(file: 'clients' | 'tasks' | 'technicians' | 'reminders'): Promise<T[]> {
    try {
        const url = `${API_BASE_URL}/api/data?file=${file}.json`;
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Failed to fetch ${file}`);
        }
        return response.json();
    } catch (error) {
        console.error(`Error in fetchData for ${file}:`, error);
        return [];
    }
}

const localApi = {
    // Clients
    getClients: async ({ page = 1, limit = 10, searchTerm }: { page?: number; limit?: number, searchTerm?: string }) => {
        let allClients = await localApi.getAllClients();
        if (searchTerm) {
            allClients = allClients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        const totalPages = Math.ceil(allClients.length / limit);
        const paginatedClients = allClients.slice((page - 1) * limit, page * limit);
        
        return { clients: paginatedClients, totalPages };
    },
    getAllClients: async (): Promise<Client[]> => {
        return fetchData<Client>('clients');
    },
    getClient: async (id: string) => {
        const clients = await localApi.getAllClients();
        return clients.find(c => c.id === id) || null;
    },
    
    // Technicians
    getTechnicians: async ({ page = 1, limit = 10, searchTerm }: { page?: number; limit?: number; searchTerm?: string }) => {
        let allTechnicians = await localApi.getAllTechnicians();
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            allTechnicians = allTechnicians.filter(t => 
                t.firstName.toLowerCase().includes(lowercasedTerm) ||
                t.lastName.toLowerCase().includes(lowercasedTerm)
            );
        }

        const totalPages = Math.ceil(allTechnicians.length / limit);
        const paginatedTechnicians = allTechnicians.slice((page - 1) * limit, page * limit);

        return { technicians: paginatedTechnicians, totalPages };
    },
    getAllTechnicians: async (): Promise<Technician[]> => {
        return fetchData<Technician>('technicians');
    },
    getTechnician: async (id: string) => {
        const technicians = await localApi.getAllTechnicians();
        return technicians.find(t => t.id === id) || null;
    },
    getTechniciansByIds: async (ids: string[]) => {
       if (!ids || ids.length === 0) return [];
       const technicians = await localApi.getAllTechnicians();
       return technicians.filter(t => ids.includes(t.id));
    },

    // Tasks
    getTasks: async (
        { page = 1, limit = 10, searchTerm, status, dateRange, date }: 
        { page?: number; limit?: number; searchTerm?: string; status?: TaskStatus; dateRange?: string, date?: string }
    ) => {
        const [tasks, clients] = await Promise.all([
            fetchData<Task>('tasks'),
            localApi.getAllClients()
        ]);

        let filteredTasks = tasks;

        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            const matchingClientIds = clients
                .filter(c => c.name.toLowerCase().includes(lowercasedTerm))
                .map(c => c.id);
            filteredTasks = filteredTasks.filter(t => matchingClientIds.includes(t.clientId));
        }

        if (status) {
            filteredTasks = filteredTasks.filter(t => t.status === status);
        }
        
        const now = new Date();
        let interval: { start: Date, end: Date } | null = null;
        
        if (date) {
             try {
                const selectedDate = parseISO(date);
                if (isValid(selectedDate)) {
                    interval = { start: startOfDay(selectedDate), end: endOfDay(selectedDate) };
                }
            } catch (e) {
                console.error("Error parsing date for filtering: ", e);
            }
        } else if (dateRange) {
            if (dateRange === 'week') {
                interval = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
            } else if (dateRange === 'month') {
                interval = { start: startOfMonth(now), end: endOfMonth(now) };
            } else if (dateRange === 'year') {
                interval = { start: startOfYear(now), end: endOfYear(now) };
            }
        }

        if (interval) {
            const { start, end } = interval;
            filteredTasks = filteredTasks.filter(t => {
                try {
                    const taskDate = parseISO(t.date);
                    return isValid(taskDate) && isWithinInterval(taskDate, { start, end });
                } catch (e) {
                    return false;
                }
            });
        }
        
        filteredTasks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const totalPages = Math.ceil(filteredTasks.length / limit);
        const paginatedTasks = filteredTasks.slice((page - 1) * limit, page * limit);
        
        return {
            tasks: paginatedTasks,
            totalPages: totalPages
        };
    },
    getTask: async (id: string) => {
        const tasks = await fetchData<Task>('tasks');
        return tasks.find(t => t.id === id) || null;
    },
    getTasksByClientId: async (clientId: string) => {
        const tasks = await fetchData<Task>('tasks');
        return tasks.filter(t => t.clientId === clientId);
    },
    getTasksByTechnicianId: async (technicianId: string) => {
        const tasks = await fetchData<Task>('tasks');
        return tasks.filter(t => t.technicianIds.includes(technicianId));
    },

    // Reminders
    getReminders: async (): Promise<Reminder[]> => {
        const reminders = await fetchData<Reminder>('reminders');
        // sort by due date ascending
        return reminders.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    },

    // Dashboard
    getDashboardData: async () => {
        const [tasks, technicians, clients, reminders] = await Promise.all([
            localApi.getTasks({limit: 1000}).then(res => res.tasks),
            localApi.getAllTechnicians(),
            localApi.getAllClients(),
            localApi.getReminders(),
        ]);

        return {
            tasks,
            technicians,
            clients,
            reminders,
        }
    }
};

export default localApi;
