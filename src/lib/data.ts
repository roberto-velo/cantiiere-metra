
import type { Client, Technician, Task, TaskStatus } from './types';
import path from 'path';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, isValid, startOfYear, endOfYear } from 'date-fns';


// Using require for JSON files is one way to read them at build time on the server.
// This avoids using the 'fs' module in code that might be bundled for the client.
import clientsData from './db/clients.json';
import techniciansData from './db/technicians.json';
import tasksData from './db/tasks.json';

// --- API Simulation using in-memory data ---
// This file is now ONLY for READING data. All mutation (write) logic
// has been moved to server actions in /lib/actions.ts to fix the 'fs' module error.

const localApi = {
    // Clients
    getClients: async (page = 1, limit = 10) => {
        const start = (page - 1) * limit;
        const end = page * limit;
        return {
            clients: clientsData.slice(start, end),
            totalPages: Math.ceil(clientsData.length / limit)
        };
    },
    getAllClients: async (): Promise<Client[]> => {
        return JSON.parse(JSON.stringify(clientsData));
    },
    getClient: async (id: string) => {
        return clientsData.find(c => c.id === id) || null;
    },
    
    // Technicians
    getTechnicians: async (page = 1, limit = 10) => {
        const start = (page - 1) * limit;
        const end = page * limit;
        return {
            technicians: techniciansData.slice(start, end),
            totalPages: Math.ceil(techniciansData.length / limit)
        };
    },
    getAllTechnicians: async (): Promise<Technician[]> => {
        return JSON.parse(JSON.stringify(techniciansData));
    },
    getTechnician: async (id: string) => {
        return techniciansData.find(t => t.id === id) || null;
    },

    // Tasks
    getTasks: async (
        { page = 1, limit = 10, searchTerm, status, dateRange }: 
        { page?: number; limit?: number; searchTerm?: string; status?: TaskStatus; dateRange?: string }
    ) => {
        let filteredTasks: Task[] = JSON.parse(JSON.stringify(tasksData));
        const clients = await localApi.getAllClients();
        const technicians = await localApi.getAllTechnicians();

        // 1. Filter by searchTerm
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filteredTasks = filteredTasks.filter(task => {
                const client = clients.find(c => c.id === task.clientId);
                const technician = technicians.find(t => t.id === task.technicianId);
                const clientName = client ? client.name.toLowerCase() : '';
                const technicianName = technician ? `${technician.firstName.toLowerCase()} ${technician.lastName.toLowerCase()}` : '';

                return (
                    task.description.toLowerCase().includes(lowercasedTerm) ||
                    clientName.includes(lowercasedTerm) ||
                    technicianName.includes(lowercasedTerm)
                );
            });
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
        return tasksData.find(t => t.id === id) || null;
    },
    getTasksByClientId: async (clientId: string) => {
        return tasksData.filter(t => t.clientId === clientId);
    },
    getTasksByTechnicianId: async (technicianId: string) => {
        return tasksData.filter(t => t.technicianId === technicianId);
    },
    
    // Dashboard
    getDashboardData: async () => {
        const sortedTasks = [...tasksData].sort((a,b) => {
             const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (dateA === dateB) {
                return a.time.localeCompare(b.time);
            }
            return dateB - dateA;
        });
        return {
            tasks: sortedTasks,
            technicians: techniciansData,
            clients: clientsData
        }
    }
};

export default localApi;
