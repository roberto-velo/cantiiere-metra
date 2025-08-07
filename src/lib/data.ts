
import type { Client, Technician, Task, TaskStatus, Reminder } from './types';
import { supabase } from './supabase';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, isValid, startOfYear, endOfYear, startOfDay, endOfDay } from 'date-fns';

const localApi = {
    // Clients
    getClients: async ({ page = 1, limit = 10, searchTerm }: { page?: number; limit?: number, searchTerm?: string }) => {
        let query = supabase.from('clients').select('*', { count: 'exact' });

        if (searchTerm) {
            query = query.ilike('name', `%${searchTerm}%`);
        }
        
        const start = (page - 1) * limit;
        const end = page * limit - 1;
        query = query.range(start, end).order('id');

        const { data, error, count } = await query;
        if (error) {
            console.error('Error fetching clients:', error);
            return { clients: [], totalPages: 0 };
        }
        
        return {
            clients: data,
            totalPages: Math.ceil((count || 0) / limit)
        };
    },
    getAllClients: async (): Promise<Client[]> => {
        const { data, error } = await supabase.from('clients').select('*');
        if (error) {
            console.error('Error fetching all clients:', error);
            return [];
        }
        return data as Client[];
    },
    getClient: async (id: number) => {
        const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
        if (error) {
            console.error('Error fetching client:', error);
            return null;
        }
        return data as Client;
    },
    
    // Technicians
    getTechnicians: async ({ page = 1, limit = 10, searchTerm }: { page?: number; limit?: number; searchTerm?: string }) => {
        let query = supabase.from('technicians').select('*', { count: 'exact' });

        if (searchTerm) {
            query = query.or(`firstName.ilike.%${searchTerm}%,lastName.ilike.%${searchTerm}%`);
        }
        
        const start = (page - 1) * limit;
        const end = page * limit -1;
        query = query.range(start, end).order('id');
        
        const { data, error, count } = await query;
        if (error) {
            console.error('Error fetching technicians:', error);
            return { technicians: [], totalPages: 0 };
        }
        return {
            technicians: data,
            totalPages: Math.ceil((count || 0) / limit)
        };
    },
    getAllTechnicians: async (): Promise<Technician[]> => {
        const { data, error } = await supabase.from('technicians').select('*');
        if (error) {
            console.error('Error fetching all technicians:', error);
            return [];
        }
        return data as Technician[];
    },
    getTechnician: async (id: number) => {
        const { data, error } = await supabase.from('technicians').select('*').eq('id', id).single();
         if (error) {
            console.error('Error fetching technician:', error);
            return null;
        }
        return data as Technician;
    },
    getTechniciansByIds: async (ids: number[]) => {
       if (!ids || ids.length === 0) return [];
       const { data, error } = await supabase.from('technicians').select('*').in('id', ids);
        if (error) {
            console.error('Error fetching technicians by IDs:', error);
            return [];
        }
        return data as Technician[];
    },

    // Tasks
    getTasks: async (
        { page = 1, limit = 10, searchTerm, status, dateRange, date }: 
        { page?: number; limit?: number; searchTerm?: string; status?: TaskStatus; dateRange?: string, date?: string }
    ) => {
        let query = supabase.from('tasks').select('*, clients!inner(name)', { count: 'exact' });

        if (searchTerm) {
            query = query.ilike('clients.name', `%${searchTerm}%`);
        }

        if (status) {
            query = query.eq('status', status);
        }
        
        if (date) {
             try {
                const selectedDate = parseISO(date);
                if (isValid(selectedDate)) {
                    query = query.gte('date', startOfDay(selectedDate).toISOString())
                                 .lte('date', endOfDay(selectedDate).toISOString());
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
                query = query.gte('date', interval.start.toISOString())
                             .lte('date', interval.end.toISOString());
            }
        }
        
        query = query.order('date', { ascending: false }).order('time', { ascending: false });

        const start = (page - 1) * limit;
        const end = page * limit - 1;
        query = query.range(start, end);

        const { data, error, count } = await query;
        if (error) {
            console.error('Error fetching tasks:', error);
            return { tasks: [], totalPages: 0 };
        }
        
        const tasks = data.map(({ clients, ...task }) => task);
        
        return {
            tasks: tasks as Task[],
            totalPages: Math.ceil((count || 0) / limit)
        };
    },
    getTask: async (id: number) => {
        const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single();
         if (error) {
            console.error('Error fetching task:', error);
            return null;
        }
        return data as Task;
    },
    getTasksByClientId: async (clientId: number) => {
        const { data, error } = await supabase.from('tasks').select('*').eq('clientId', clientId);
        if (error) {
            console.error('Error fetching tasks by client ID:', error);
            return [];
        }
        return data as Task[];
    },
    getTasksByTechnicianId: async (technicianId: number) => {
         const { data, error } = await supabase.from('tasks').select('*').contains('technicianIds', [technicianId]);
         if (error) {
            console.error('Error fetching tasks by technician ID:', error);
            return [];
        }
        return data as Task[];
    },
    
    // Reminders
    getReminders: async (): Promise<Reminder[]> => {
        const { data, error } = await supabase.from('reminders').select('*');
        if (error) {
            console.error('Error fetching reminders:', error);
            return [];
        }
        return data as Reminder[];
    },

    // Dashboard
    getDashboardData: async () => {
        const [tasks, technicians, clients, reminders] = await Promise.all([
            localApi.getTasks({limit: 1000}),
            localApi.getAllTechnicians(),
            localApi.getAllClients(),
            localApi.getReminders()
        ]);

        return {
            tasks: tasks.tasks,
            technicians,
            clients,
            reminders,
        }
    }
};

export default localApi;
