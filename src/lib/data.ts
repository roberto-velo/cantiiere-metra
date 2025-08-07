

import type { Client, Technician, Task, TaskStatus, Reminder } from './types';
import path from 'path';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, isValid, startOfYear, endOfYear, startOfDay, endOfDay } from 'date-fns';


// Using require for JSON files is one way to read them at build time on the server.
// This avoids using the 'fs' module in code that might be bundled for the client.
import clientsData from './db/clients.json';
import techniciansData from './db/technicians.json';
import tasksData from './db/tasks.json';
import remindersData from './db/reminders.json';

// --- API Simulation using in-memory data ---
// This file is now ONLY for READING data. All mutation (write) logic
// has been moved to server actions in /lib/actions.ts to fix the 'fs' module error.

const localApi = {
    // Clients
    getClients: async ({ page = 1, limit = 10, searchTerm }: { page?: number; limit?: number, searchTerm?: string }) => {
        let filteredClients: Client[] = JSON.parse(JSON.stringify(clientsData));

        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filteredClients = filteredClients.filter(client => 
                client.name.toLowerCase().includes(lowercasedTerm)
            );
        }

        const start = (page - 1) * limit;
        const end = page * limit;
        return {
            clients: filteredClients.slice(start, end),
            totalPages: Math.ceil(filteredClients.length / limit)
        };
    },
    getAllClients: async (): Promise<Client[]> => {
        return JSON.parse(JSON.stringify(clientsData));
    },
    getClient: async (id: string) => {
        return clientsData.find(c => c.id === id) || null;
    },
    
    // Technicians
    getTechnicians: async ({ page = 1, limit = 10, searchTerm }: { page?: number; limit?: number; searchTerm?: string }) => {
        let filteredTechnicians: Technician[] = JSON.parse(JSON.stringify(techniciansData));

        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filteredTechnicians = filteredTechnicians.filter(technician =>
                technician.firstName.toLowerCase().includes(lowercasedTerm) ||
                technician.lastName.toLowerCase().includes(lowercasedTerm)
            );
        }

        const start = (page - 1) * limit;
        const end = page * limit;
        return {
            technicians: filteredTechnicians.slice(start, end),
            totalPages: Math.ceil(filteredTechnicians.length / limit)
        };
    },
    getAllTechnicians: async (): Promise<Technician[]> => {
        return JSON.parse(JSON.stringify(techniciansData));
    },
    getTechnician: async (id: string) => {
        return techniciansData.find(t => t.id === id) || null;
    },
    getTechniciansByIds: async (ids: string[]) => {
        return techniciansData.filter(t => ids.includes(t.id));
    },

    // Tasks
    getTasks: async (
        { page = 1, limit = 10, searchTerm, status, dateRange, date }: 
        { page?: number; limit?: number; searchTerm?: string; status?: TaskStatus; dateRange?: string, date?: string }
    ) => {
        let filteredTasks: Task[] = JSON.parse(JSON.stringify(tasksData));
        const clients = await localApi.getAllClients();
        const technicians = await localApi.getAllTechnicians();

        // 1. Filter by searchTerm (client only)
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filteredTasks = filteredTasks.filter(task => {
                const client = clients.find(c => c.id === task.clientId);
                const clientName = client ? client.name.toLowerCase() : '';
                return clientName.includes(lowercasedTerm);
            });
        }

        // 2. Filter by status
        if (status) {
            filteredTasks = filteredTasks.filter(task => task.status === status);
        }

        // 3. Filter by dateRange or specific date
        if (date) {
             try {
                const selectedDate = parseISO(date);
                if (isValid(selectedDate)) {
                    const dayInterval = { start: startOfDay(selectedDate), end: endOfDay(selectedDate) };
                    filteredTasks = filteredTasks.filter(task => {
                        try {
                            const taskDate = parseISO(task.date);
                            return isValid(taskDate) && isWithinInterval(taskDate, dayInterval);
                        } catch {
                            return false;
                        }
                    });
                }
            } catch (e) {
                console.error("Error parsing date for filtering: ", e);
            }
        } else if (dateRange) {
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
                    try {
                        const taskDate = parseISO(task.date);
                        return isValid(taskDate) && isWithinInterval(taskDate, interval!);
                    } catch {
                        return false;
                    }
                });
            }
        }
        
        const sortedTasks = filteredTasks.sort((a,b) => {
            const dateA = new Date(`${a.date}T${a.time}`).getTime();
            const dateB = new Date(`${b.date}T${b.time}`).getTime();
            if (isNaN(dateA) || isNaN(dateB)) return 0;
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
        return tasksData.filter(t => t.technicianIds.includes(technicianId));
    },
    
    // Reminders
    getReminders: async (): Promise<Reminder[]> => {
        return JSON.parse(JSON.stringify(remindersData));
    },

    // Dashboard
    getDashboardData: async () => {
        const sortedTasks = [...tasksData].sort((a,b) => {
             const dateA = new Date(`${a.date}T${a.time}`).getTime();
            const dateB = new Date(`${b.date}T${b.time}`).getTime();
            if (isNaN(dateA) || isNaN(dateB)) return 0;
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
