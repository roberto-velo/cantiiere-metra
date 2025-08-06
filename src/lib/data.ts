
import type { Client, Technician, Task, TaskStatus } from './types';
import path from 'path';

// Using require inside the functions ensures fs is only used server-side.


// Define paths to the JSON data files
const dataDir = path.join(process.cwd(), 'src', 'lib', 'db');
const clientsPath = path.join(dataDir, 'clients.json');
const techniciansPath = path.join(dataDir, 'technicians.json');
const tasksPath = path.join(dataDir, 'tasks.json');

// Helper function to read data from a JSON file
const readData = <T>(filePath: string): T[] => {
    const fs = require('fs');
    try {
        const jsonData = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(jsonData) as T[];
    } catch (error) {
        console.error(`Error reading data from ${filePath}:`, error);
        return [];
    }
};

// Helper function to write data to a JSON file
const writeData = (filePath: string, data: any): void => {
    const fs = require('fs');
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Error writing data to ${filePath}:`, error);
    }
};


// --- API Simulation using JSON files ---

const localApi = {
    // Clients
    getClients: async (page = 1, limit = 10) => {
        const clients = readData<Client>(clientsPath);
        const start = (page - 1) * limit;
        const end = page * limit;
        return {
            clients: clients.slice(start, end),
            totalPages: Math.ceil(clients.length / limit)
        };
    },
    getAllClients: async () => readData<Client>(clientsPath),
    getClient: async (id: string) => {
        const clients = readData<Client>(clientsPath);
        return clients.find(c => c.id === id) || null;
    },
    addClient: async (clientData: Omit<Client, 'id'>) => {
        const clients = readData<Client>(clientsPath);
        const newClient: Client = {
            id: String(Date.now()), // More robust ID generation
            ...clientData
        };
        clients.push(newClient);
        writeData(clientsPath, clients);
        return newClient;
    },
    updateClient: async (id: string, clientData: Partial<Omit<Client, 'id'>>) => {
        const clients = readData<Client>(clientsPath);
        const index = clients.findIndex(c => c.id === id);
        if (index > -1) {
            clients[index] = { ...clients[index], ...clientData };
            writeData(clientsPath, clients);
            return clients[index];
        }
        return null;
    },
    deleteClient: async (id: string) => {
        let clients = readData<Client>(clientsPath);
        let tasks = readData<Task>(tasksPath);
        const initialLength = clients.length;
        
        const updatedClients = clients.filter(c => c.id !== id);
        
        if (updatedClients.length < initialLength) {
             // Also delete related tasks
            const updatedTasks = tasks.filter(t => t.clientId !== id);
            writeData(clientsPath, updatedClients);
            writeData(tasksPath, updatedTasks);
            return true;
        }
        return false;
    },

    // Technicians
    getTechnicians: async (page = 1, limit = 10) => {
        const technicians = readData<Technician>(techniciansPath);
        const start = (page - 1) * limit;
        const end = page * limit;
        return {
            technicians: technicians.slice(start, end),
            totalPages: Math.ceil(technicians.length / limit)
        };
    },
    getAllTechnicians: async () => readData<Technician>(techniciansPath),
    getTechnician: async (id: string) => {
        const technicians = readData<Technician>(techniciansPath);
        return technicians.find(t => t.id === id) || null;
    },
    addTechnician: async (technicianData: Omit<Technician, 'id'>) => {
        const technicians = readData<Technician>(techniciansPath);
        const newTechnician: Technician = {
            id: String(Date.now()),
            ...technicianData
        };
        technicians.push(newTechnician);
        writeData(techniciansPath, technicians);
        return newTechnician;
    },

    // Tasks
    getTasks: async (page = 1, limit = 10) => {
        const tasks = readData<Task>(tasksPath);
        const start = (page - 1) * limit;
        const end = page * limit;
        const sortedTasks = tasks.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return {
            tasks: sortedTasks.slice(start, end),
            totalPages: Math.ceil(tasks.length / limit)
        };
    },
    getTask: async (id: string) => {
        const tasks = readData<Task>(tasksPath);
        return tasks.find(t => t.id === id) || null;
    },
    getTasksByClientId: async (clientId: string) => {
        const tasks = readData<Task>(tasksPath);
        return tasks.filter(t => t.clientId === clientId);
    },
    getTasksByTechnicianId: async (technicianId: string) => {
        const tasks = readData<Task>(tasksPath);
        return tasks.filter(t => t.technicianId === technicianId);
    },
    addTask: async (taskData: Omit<Task, 'id' | 'photos' | 'documents'> & { photos?: any, documents?: any }) => {
        const tasks = readData<Task>(tasksPath);
        const newTask: Task = {
            id: String(Date.now()),
            ...taskData,
            photos: [],
            documents: [],
        };
        tasks.push(newTask);
        writeData(tasksPath, tasks);
        return newTask;
    },
    updateTaskStatus: async (taskId: string, status: TaskStatus) => {
        const tasks = readData<Task>(tasksPath);
        const index = tasks.findIndex(t => t.id === taskId);
        if (index > -1) {
            tasks[index].status = status;
            writeData(tasksPath, tasks);
            return tasks[index];
        }
        return null;
    },
    deleteTask: async (id: string) => {
        const tasks = readData<Task>(tasksPath);
        const initialLength = tasks.length;
        const updatedTasks = tasks.filter(t => t.id !== id);
        if (updatedTasks.length < initialLength) {
            writeData(tasksPath, updatedTasks);
            return true;
        }
        return false;
    },

    // Dashboard
    getDashboardData: async () => {
        const tasks = readData<Task>(tasksPath);
        const technicians = readData<Technician>(techniciansPath);
        const clients = readData<Client>(clientsPath);
        const sortedTasks = tasks.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return {
            tasks: sortedTasks,
            technicians,
            clients
        }
    }
};

export default localApi;
