
import type { Client, Technician, Task, TaskStatus } from './types';
import path from 'path';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, isValid, startOfYear, endOfYear } from 'date-fns';


// Using require for JSON files is one way to read them at build time on the server.
// This avoids using the 'fs' module in code that might be bundled for the client.
import clients from './db/clients.json';
import technicians from './db/technicians.json';
import tasks from './db/tasks.json';

// --- API Simulation using in-memory data ---
// This file is now ONLY for READING data. All mutation (write) logic
// has been moved to server actions in /lib/actions.ts to fix the 'fs' module error.

const localApi = {
    // Clients
    getClients: async (page = 1, limit = 10) => {
        const start = (page - 1) * limit;
        const end = page * limit;
        return {
            clients: clients.slice(start, end),
            totalPages: Math.ceil(clients.length / limit)
        };
    },
    getAllClients: async (): Promise<Client[]> => {
        return JSON.parse(JSON.stringify(clients));
    },
    getClient: async (id: string) => {
        return clients.find(c => c.id === id) || null;
    },
    
    // Technicians
    getTechnicians: async (page = 1, limit = 10) => {
        const start = (page - 1) * limit;
        const end = page * limit;
        return {
            technicians: technicians.slice(start, end),
            totalPages: Math.ceil(technicians.length / limit)
        };
    },
    getAllTechnicians: async (): Promise<Technician[]> => {
        return JSON.parse(JSON.stringify(technicians));
    },
    getTechnician: async (id: string) => {
        return technicians.find(t => t.id === id) || null;
    },

    // Tasks
    getTasks: async (
        { page = 1, limit = 10, searchTerm, status, dateRange }: 
        { page?: number; limit?: number; searchTerm?: string; status?: TaskStatus; dateRange?: string }
    ) => {
        let filteredTasks: Task[] = JSON.parse(JSON.stringify(tasks));

        // 1. Filter by searchTerm
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filteredTasks = filteredTasks.filter(task =>
                task.description.toLowerCase().includes(lowercasedTerm)
            );
        }

        // 2. Filter by status
        if (status) {
            filteredTasks = filteredTasks.filter(task => task.status === status);
        }

        // 3. Filter by dateRange
        if (dateRange) {
            const now = new Date();
            let interval: { start: Date, end: Date } | null = null;

            if (dateRange === 'week') {
                interval = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
            } else if (dateRange === 'month') {
                interval = { start: startOfMonth(now), end: endOfMonth(now) };
            } else if (dateRange === 'year') {
                interval = { start: startOfYear(now), end: endOfYear(now) };
            }

            if (interval) {
                 filteredTasks = filteredTasks.filter(task => {
                    const taskDate = parseISO(task.date);
                    return isValid(taskDate) && isWithinInterval(taskDate, interval!);
                });
            }
        }
        
        const sortedTasks = filteredTasks.sort((a,b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (dateA === dateB) {
                return a.time.localeCompare(b.time);
            }
            return dateB - dateA;
        });

        const start = (page - 1) * limit;
        const end = page * limit;
        
        return {
            tasks: sortedTasks.slice(start, end),
            totalPages: Math.ceil(sortedTasks.length / limit)
        };
    },
    getTask: async (id: string) => {
        return tasks.find(t => t.id === id) || null;
    },
    getTasksByClientId: async (clientId: string) => {
        return tasks.filter(t => t.clientId === clientId);
    },
    getTasksByTechnicianId: async (technicianId: string) => {
        return tasks.filter(t => t.technicianId === technicianId);
    },
    
    // Dashboard
    getDashboardData: async () => {
        const sortedTasks = [...tasks].sort((a,b) => {
             const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (dateA === dateB) {
                return a.time.localeCompare(b.time);
            }
            return dateB - dateA;
        });
        return {
            tasks: sortedTasks,
            technicians,
            clients
        }
    }
};

export default localApi;
