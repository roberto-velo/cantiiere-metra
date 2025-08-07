
import type { Client, Technician, Task, TaskStatus, Reminder } from './types';
import path from 'path';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, isValid, startOfYear, endOfYear, startOfDay, endOfDay } from 'date-fns';

// This is the main data fetching logic. It now uses a custom API
// to fetch data, making it compatible with production environments
// where direct file system access is restricted.

// Helper function to fetch data from our API
const fetchData = async (fileName: string) => {
    // Determine the base URL based on the environment
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const url = new URL('/api/data', baseUrl);
    url.searchParams.set('file', fileName);

    try {
        // Use a relative path for fetch on the server, and the full URL for client-side fetches.
        // This is a more robust way to handle API calls in Next.js.
        const fetchUrl = typeof window === 'undefined' ? new URL(`/api/data?file=${fileName}`, baseUrl) : url;

        const response = await fetch(fetchUrl.toString(), {
            // Revalidate frequently to get fresh data, but cache for a short period
            // to avoid excessive requests during a single user interaction.
            next: { revalidate: 1 } 
        });

        if (!response.ok) {
            console.error(`Failed to fetch ${fileName}: ${response.statusText}`);
            return [];
        }

        return await response.json();
    } catch (error) {
        console.error(`Network or fetch error for ${fileName}:`, error);
        // In case of a complete fetch failure, return an empty array to prevent crashes
        return [];
    }
};


const localApi = {
    // Clients
    getClients: async ({ page = 1, limit = 10, searchTerm }: { page?: number; limit?: number, searchTerm?: string }) => {
        let filteredClients: Client[] = await fetchData('clients.json');

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
        return fetchData('clients.json');
    },
    getClient: async (id: string) => {
        const clients: Client[] = await fetchData('clients.json');
        return clients.find(c => c.id === id) || null;
    },
    
    // Technicians
    getTechnicians: async ({ page = 1, limit = 10, searchTerm }: { page?: number; limit?: number; searchTerm?: string }) => {
        let filteredTechnicians: Technician[] = await fetchData('technicians.json');

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
        return fetchData('technicians.json');
    },
    getTechnician: async (id: string) => {
        const technicians: Technician[] = await fetchData('technicians.json');
        return technicians.find(t => t.id === id) || null;
    },
    getTechniciansByIds: async (ids: string[]) => {
        const technicians: Technician[] = await fetchData('technicians.json');
        return technicians.filter(t => ids.includes(t.id));
    },

    // Tasks
    getTasks: async (
        { page = 1, limit = 10, searchTerm, status, dateRange, date }: 
        { page?: number; limit?: number; searchTerm?: string; status?: TaskStatus; dateRange?: string, date?: string }
    ) => {
        let filteredTasks: Task[] = await fetchData('tasks.json');
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
        const tasks: Task[] = await fetchData('tasks.json');
        return tasks.find(t => t.id === id) || null;
    },
    getTasksByClientId: async (clientId: string) => {
        const tasks: Task[] = await fetchData('tasks.json');
        return tasks.filter(t => t.clientId === clientId);
    },
    getTasksByTechnicianId: async (technicianId: string) => {
        const tasks: Task[] = await fetchData('tasks.json');
        return tasks.filter(t => t.technicianIds.includes(technicianId));
    },
    
    // Reminders
    getReminders: async (): Promise<Reminder[]> => {
        return fetchData('reminders.json');
    },

    // Dashboard
    getDashboardData: async () => {
        const [tasksData, techniciansData, clientsData, remindersData] = await Promise.all([
            fetchData('tasks.json'),
            fetchData('technicians.json'),
            fetchData('clients.json'),
            fetchData('reminders.json')
        ]);

        const sortedTasks = [...tasksData].sort((a,b) => {
             const dateA = new Date(`${a.date}T${a.time}`).getTime();
            const dateB = new Date(`${b.date}T${b.time}`).getTime();
            if (isNaN(dateA) || isNaN(dateB)) return 0;
            return dateB - dateA;
        });
        return {
            tasks: sortedTasks,
            technicians: techniciansData,
            clients: clientsData,
            reminders: remindersData,
        }
    }
};

export default localApi;
