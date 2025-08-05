// In-memory data store for the prototype
import type { Client, Technician, Task, TaskStatus } from './types';

let clients: Client[] = [
    {
        id: '1',
        name: 'ACME S.r.l.',
        address: 'Via dei Pini, 123, 00100 Roma RM',
        phone: '06 12345678',
        email: 'info@acme.it',
        clientCode: 'ACM123',
        mapUrl: 'https://maps.google.com/maps?q=Via%20dei%20Pini%2C%20123%2C%2000100%20Roma%20RM&output=embed',
    },
    {
        id: '2',
        name: 'Rossi Costruzioni',
        address: 'Corso Magenta, 45, 20123 Milano MI',
        phone: '02 98765432',
        email: 'rossi@costruzioni.com',
        clientCode: 'ROS456',
        mapUrl: 'https://maps.google.com/maps?q=Corso%20Magenta%2C%2045%2C%2020123%20Milano%20MI&output=embed',
    },
    {
        id: '3',
        name: 'Verdi Impianti',
        address: 'Via San Felice, 1, 40122 Bologna BO',
        phone: '051 11223344',
        email: 'amministrazione@verdiimpianti.it',
        clientCode: 'VER789',
        mapUrl: 'https://maps.google.com/maps?q=Via%20San%20Felice%2C%201%2C%2040122%20Bologna%20BO&output=embed',
    }
];

let technicians: Technician[] = [
    {
        id: '1',
        firstName: 'Mario',
        lastName: 'Rossi',
        phone: '333 1234567',
        role: 'Idraulico Specializzato',
        qualifications: [
            { id: 'q1', name: 'Certificazione Gas', expiryDate: '2025-12-31' },
            { id: 'q2', name: 'Abilitazione Climatizzatori', expiryDate: '2026-06-30' },
        ]
    },
    {
        id: '2',
        firstName: 'Luigi',
        lastName: 'Verdi',
        phone: '347 7654321',
        role: 'Elettricista',
        qualifications: [
            { id: 'q3', name: 'PES/PAV', expiryDate: '2024-10-20' },
        ]
    }
];

let tasks: Task[] = [
    {
        id: '1',
        clientId: '1',
        technicianId: '1',
        date: '2024-08-10',
        time: '09:00',
        description: 'Sostituzione caldaia condominiale',
        status: 'Pianificato',
        priority: 'Alta',
        photos: [],
        documents: [
            { id: 'd1', name: 'Manuale Caldaia.pdf', url: '#' },
            { id: 'd2', name: 'Schema Impianto.pdf', url: '#' },
        ],
        notes: 'Il cliente ha richiesto intervento urgente. Portare ricambi specifici modello X.'
    },
    {
        id: '2',
        clientId: '2',
        technicianId: '2',
        date: '2024-08-12',
        time: '14:30',
        description: 'Riparazione quadro elettrico principale',
        status: 'In corso',
        priority: 'Alta',
        photos: [
             { id: 'p1', url: 'https://placehold.co/400x400.png', description: 'Quadro prima' },
             { id: 'p2', url: 'https://placehold.co/400x400.png', description: 'Dettaglio del danno' },
        ],
        documents: [],
        notes: ''
    },
    {
        id: '3',
        clientId: '3',
        technicianId: '1',
        date: '2024-08-05',
        time: '11:00',
        description: 'Manutenzione ordinaria impianto idraulico',
        status: 'Completato',
        priority: 'Media',
        photos: [],
        documents: [
            { id: 'd3', name: 'Rapporto Intervento.pdf', url: '#' }
        ],
        notes: 'Intervento completato con successo. Nessuna anomalia riscontrata.'
    },
];


// --- API Simulation ---

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
    getAllClients: async () => clients,
    getClient: async (id: string) => clients.find(c => c.id === id) || null,
    addClient: async (clientData: Omit<Client, 'id'>) => {
        const newClient: Client = {
            id: String(clients.length + 1),
            ...clientData
        };
        clients.push(newClient);
        return newClient;
    },
    updateClient: async (id: string, clientData: Partial<Client>) => {
        const index = clients.findIndex(c => c.id === id);
        if (index > -1) {
            clients[index] = { ...clients[index], ...clientData };
            return clients[index];
        }
        return null;
    },
    deleteClient: async (id: string) => {
        clients = clients.filter(c => c.id !== id);
        tasks = tasks.filter(t => t.clientId !== id); // Also delete related tasks
        return true;
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
    getAllTechnicians: async () => technicians,
    getTechnician: async (id: string) => technicians.find(t => t.id === id) || null,
    addTechnician: async (technicianData: Omit<Technician, 'id'>) => {
        const newTechnician: Technician = {
            id: String(technicians.length + 1),
            ...technicianData
        };
        technicians.push(newTechnician);
        return newTechnician;
    },

    // Tasks
    getTasks: async (page = 1, limit = 10) => {
        const start = (page - 1) * limit;
        const end = page * limit;
        const sortedTasks = tasks.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return {
            tasks: sortedTasks.slice(start, end),
            totalPages: Math.ceil(tasks.length / limit)
        };
    },
    getTask: async (id: string) => tasks.find(t => t.id === id) || null,
    getTasksByClientId: async (clientId: string) => tasks.filter(t => t.clientId === clientId),
    getTasksByTechnicianId: async (technicianId: string) => tasks.filter(t => t.technicianId === technicianId),
    addTask: async (taskData: Omit<Task, 'id'>) => {
        const newTask: Task = {
            id: String(tasks.length + 1),
            ...taskData
        };
        tasks.push(newTask);
        return newTask;
    },
    updateTaskStatus: async (taskId: string, status: TaskStatus) => {
        const index = tasks.findIndex(t => t.id === taskId);
        if (index > -1) {
            tasks[index].status = status;
            return tasks[index];
        }
        return null;
    },

    // Dashboard
    getDashboardData: async () => {
        const sortedTasks = tasks.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return {
            tasks: sortedTasks.slice(0, 5),
            technicians,
            clients
        }
    }
};

export default localApi;
