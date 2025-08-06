
'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import type { Client, Task, TaskStatus, Technician, Photo, Document } from './types';

const dataDir = path.join(process.cwd(), 'src', 'lib', 'db');

const readData = (fileName: string) => {
    const filePath = path.join(dataDir, fileName);
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            console.log(`File not found: ${fileName}. Returning empty array.`);
            return [];
        }
        throw error;
    }
}

const writeData = (fileName: string, data: any) => {
    const filePath = path.join(dataDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// --- Client Actions ---
export async function addClientAction(clientData: Omit<Client, 'id'>) {
    try {
        const clients = readData('clients.json');
        const newClient: Client = {
            id: String(Date.now()),
            ...clientData
        };
        const updatedClients = [...clients, newClient];
        writeData('clients.json', updatedClients);
        revalidatePath('/clienti');
        return { success: true, client: newClient };
    } catch (error) {
        console.error('Error adding client:', error);
        return { success: false, message: 'Failed to add client.' };
    }
}

export async function updateClientAction(id: string, clientData: Partial<Omit<Client, 'id'>>) {
    try {
        const clients = readData('clients.json');
        const clientIndex = clients.findIndex((c: Client) => c.id === id);
        if (clientIndex === -1) {
            return { success: false, message: 'Client not found.' };
        }
        const updatedClient = { ...clients[clientIndex], ...clientData };
        clients[clientIndex] = updatedClient;
        writeData('clients.json', clients);
        revalidatePath('/clienti');
        revalidatePath(`/clienti/${id}`);
        return { success: true, client: updatedClient };
    } catch (error) {
        console.error('Error updating client:', error);
        return { success: false, message: 'Failed to update client.' };
    }
}

export async function deleteClientAction(id: string) {
    try {
        const clients = readData('clients.json');
        const updatedClients = clients.filter((c: Client) => c.id !== id);
        if (clients.length === updatedClients.length) {
             return { success: false, message: 'Client not found.' };
        }
        writeData('clients.json', updatedClients);
        revalidatePath('/clienti');
        return { success: true };
    } catch (error) {
        console.error('Error deleting client:', error);
        return { success: false, message: 'Failed to delete client.' };
    }
}


// --- Technician Actions ---
export async function addTechnicianAction(technicianData: Omit<Technician, 'id'>) {
    try {
        const technicians = readData('technicians.json');
        const newTechnician: Technician = {
            id: String(Date.now()),
            ...technicianData
        };
        const updatedTechnicians = [...technicians, newTechnician];
        writeData('technicians.json', updatedTechnicians);
        revalidatePath('/tecnici');
        return { success: true, technician: newTechnician };
    } catch (error) {
        console.error('Error adding technician:', error);
        return { success: false, message: 'Failed to add technician.' };
    }
}

// --- Task Actions ---
export async function addTaskAction(taskData: Omit<Task, 'id' | 'photos' | 'documents'> & { photos?: any, documents?: any }) {
    try {
        const tasks = readData('tasks.json');
        const newTask: Task = {
            id: String(Date.now()),
            ...taskData,
            photos: [],
            documents: [],
            duration: 0,
        };
        const updatedTasks = [...tasks, newTask];
        writeData('tasks.json', updatedTasks);
        revalidatePath('/attivita');
        return { success: true, task: newTask };
    } catch (error) {
        console.error('Error adding task:', error);
        return { success: false, message: 'Failed to add task.' };
    }
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus) {
    try {
        const tasks = readData('tasks.json');
        const taskIndex = tasks.findIndex((t: Task) => t.id === taskId);
        if (taskIndex === -1) {
            return { success: false, message: 'Task not found.' };
        }
        tasks[taskIndex].status = status;
        writeData('tasks.json', tasks);
        revalidatePath('/attivita');
        revalidatePath(`/attivita/${taskId}`);
        return { success: true, task: tasks[taskIndex] };
    } catch (error) {
        console.error('Error updating task status:', error);
        return { success: false, message: 'Failed to update task status.' };
    }
}

export async function updateTaskDurationAction(taskId: string, duration: number) {
     try {
        const tasks = readData('tasks.json');
        const taskIndex = tasks.findIndex((t: Task) => t.id === taskId);
        if (taskIndex === -1) {
            return { success: false, message: 'Task not found.' };
        }
        tasks[taskIndex].duration = duration;
        tasks[taskIndex].status = 'Completato';
        writeData('tasks.json', tasks);
        revalidatePath('/attivita');
        revalidatePath(`/attivita/${taskId}`);
        return { success: true, task: tasks[taskIndex] };
    } catch (error) {
        console.error('Error updating task duration:', error);
        return { success: false, message: 'Failed to update task duration.' };
    }
}


export async function deleteTaskAction(id: string) {
    try {
        const tasks = readData('tasks.json');
        const updatedTasks = tasks.filter((t: Task) => t.id !== id);
        if (tasks.length === updatedTasks.length) {
            return { success: false, message: 'Task not found.' };
        }
        writeData('tasks.json', updatedTasks);
        revalidatePath('/attivita');
        return { success: true };
    } catch (error) {
        console.error('Error deleting task:', error);
        return { success: false, message: 'Failed to delete task.' };
    }
}


export async function addAttachmentToTaskAction(
    { taskId, attachment, type }: { taskId: string; attachment: Omit<Photo, 'id'> | Omit<Document, 'id'>; type: 'photo' | 'document' }
) {
    try {
        const tasks = readData('tasks.json');
        const taskIndex = tasks.findIndex((t: Task) => t.id === taskId);
        if (taskIndex === -1) {
            return { success: false, message: 'Task not found.' };
        }
        
        const newAttachment = {
            id: String(Date.now()),
            ...attachment
        };

        if (type === 'photo') {
            tasks[taskIndex].photos.push(newAttachment as Photo);
        } else {
            tasks[taskIndex].documents.push(newAttachment as Document);
        }

        writeData('tasks.json', tasks);
        revalidatePath(`/attivita/${taskId}`);
        return { success: true, attachment: newAttachment };

    } catch (error) {
        console.error(`Error adding ${type}:`, error);
        return { success: false, message: `Failed to add ${type}.` };
    }
}
