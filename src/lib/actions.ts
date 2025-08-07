
'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import type { Client, Task, TaskStatus, Technician, Photo, Document, Reminder } from './types';
import { randomUUID } from 'crypto';
import localApi from './data';

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');


const writeData = async (fileName: string, data: any) => {
    // This now calls our API endpoint to write data
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    // Use a relative path for the fetch call on the server side
    const url = new URL('/api/data', baseUrl);
    url.searchParams.set('file', fileName);

    const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Failed to write data for ${fileName}:`, errorBody);
        throw new Error(`API error: Failed to write data for ${fileName}.`);
    }

    const result = await response.json();
    if (!result.success) {
         throw new Error(`API error: Failed to write data for ${fileName}.`);
    }
}

// --- Client Actions ---
export async function addClientAction(clientData: Omit<Client, 'id'>) {
    try {
        const clients = await localApi.getAllClients();
        const newClient: Client = {
            id: String(Date.now()),
            ...clientData
        };
        const updatedClients = [...clients, newClient];
        await writeData('clients.json', updatedClients);
        revalidatePath('/clienti');
        return { success: true, client: newClient };
    } catch (error) {
        console.error('Error adding client:', error);
        return { success: false, message: 'Failed to add client.' };
    }
}

export async function updateClientAction(id: string, clientData: Partial<Omit<Client, 'id'>>) {
    try {
        const clients = await localApi.getAllClients();
        const clientIndex = clients.findIndex((c: Client) => c.id === id);
        if (clientIndex === -1) {
            return { success: false, message: 'Client not found.' };
        }
        const updatedClient = { ...clients[clientIndex], ...clientData };
        clients[clientIndex] = updatedClient;
        await writeData('clients.json', clients);
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
        const clients = await localApi.getAllClients();
        const updatedClients = clients.filter((c: Client) => c.id !== id);
        if (clients.length === updatedClients.length) {
             return { success: false, message: 'Client not found.' };
        }
        await writeData('clients.json', updatedClients);
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
        const technicians = await localApi.getAllTechnicians();
        const newTechnician: Technician = {
            id: String(Date.now()),
            ...technicianData
        };
        const updatedTechnicians = [...technicians, newTechnician];
        await writeData('technicians.json', updatedTechnicians);
        revalidatePath('/tecnici');
        return { success: true, technician: newTechnician };
    } catch (error) {
        console.error('Error adding technician:', error);
        return { success: false, message: 'Failed to add technician.' };
    }
}

export async function updateTechnicianAction(id: string, technicianData: Partial<Omit<Technician, 'id'>>) {
    try {
        const technicians = await localApi.getAllTechnicians();
        const technicianIndex = technicians.findIndex((t: Technician) => t.id === id);
        if (technicianIndex === -1) {
            return { success: false, message: 'Technician not found.' };
        }
        const updatedTechnician = { ...technicians[technicianIndex], ...technicianData };
        technicians[technicianIndex] = updatedTechnician;
        await writeData('technicians.json', technicians);
        revalidatePath('/tecnici');
        revalidatePath(`/tecnici/${id}`);
        return { success: true, technician: updatedTechnician };
    } catch (error) {
        console.error('Error updating technician:', error);
        return { success: false, message: 'Failed to update technician.' };
    }
}

export async function deleteTechnicianAction(id: string) {
    try {
        const technicians = await localApi.getAllTechnicians();
        const updatedTechnicians = technicians.filter((t: Technician) => t.id !== id);
        if (technicians.length === updatedTechnicians.length) {
            return { success: false, message: 'Technician not found.' };
        }
        await writeData('technicians.json', updatedTechnicians);
        revalidatePath('/tecnici');
        return { success: true };
    } catch (error) {
        console.error('Error deleting technician:', error);
        return { success: false, message: 'Failed to delete technician.' };
    }
}

// --- Task Actions ---
export async function addTaskAction(taskData: Omit<Task, 'id' | 'photos' | 'documents'> & { photos?: any, documents?: any }) {
    try {
        const { tasks } = await localApi.getTasks({ limit: 9999 });
        const newTask: Task = {
            id: String(Date.now()),
            ...taskData,
            photos: [],
            documents: [],
            duration: 0,
        };
        const updatedTasks = [...tasks, newTask];
        await writeData('tasks.json', updatedTasks);
        revalidatePath('/attivita');
        return { success: true, task: newTask };
    } catch (error) {
        console.error('Error adding task:', error);
        return { success: false, message: 'Failed to add task.' };
    }
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus) {
    try {
        const { tasks } = await localApi.getTasks({ limit: 9999 });
        const taskIndex = tasks.findIndex((t: Task) => t.id === taskId);
        if (taskIndex === -1) {
            return { success: false, message: 'Task not found.' };
        }
        tasks[taskIndex].status = status;
        await writeData('tasks.json', tasks);
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
        const { tasks } = await localApi.getTasks({ limit: 9999 });
        const taskIndex = tasks.findIndex((t: Task) => t.id === taskId);
        if (taskIndex === -1) {
            return { success: false, message: 'Task not found.' };
        }
        tasks[taskIndex].duration = duration;
        tasks[taskIndex].status = 'Completato';
        await writeData('tasks.json', tasks);
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
        const { tasks } = await localApi.getTasks({ limit: 9999 });
        const updatedTasks = tasks.filter((t: Task) => t.id !== id);
        if (tasks.length === updatedTasks.length) {
            return { success: false, message: 'Task not found.' };
        }
        await writeData('tasks.json', updatedTasks);
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
        const { tasks } = await localApi.getTasks({ limit: 9999 });
        const taskIndex = tasks.findIndex((t: Task) => t.id === taskId);
        if (taskIndex === -1) {
            return { success: false, message: 'Task not found.' };
        }

        // Ensure uploads directory exists
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Handle file saving
        const dataUrl = attachment.url;
        const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
        if (!matches) {
            return { success: false, message: 'Invalid file format.' };
        }
        
        const [, mimeType, base64Data] = matches;
        const extension = mimeType.split('/').pop() || 'tmp';
        const fileId = randomUUID();
        const originalName = (attachment as Document).name || 'file';
        const safeOriginalName = originalName.replace(/[^a-zA-Z0-9-_\.]/g, '_');
        const fileName = `${fileId}.${extension}`;
        const filePath = path.join(uploadsDir, fileName);
        
        const fileBuffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filePath, fileBuffer);
        
        const publicUrl = `/uploads/${fileName}`;

        const newAttachment = {
            id: String(Date.now()),
            name: type === 'document' ? safeOriginalName : fileName,
            description: type === 'photo' ? (attachment as Photo).description : '',
            url: publicUrl,
        };

        if (type === 'photo') {
            tasks[taskIndex].photos.push(newAttachment as Photo);
        } else {
            tasks[taskIndex].documents.push(newAttachment as Document);
        }

        await writeData('tasks.json', tasks);
        revalidatePath(`/attivita/${taskId}`);
        revalidatePath(`/clienti`); // To refresh client attachments too
        return { success: true, attachment: newAttachment };

    } catch (error) {
        console.error(`Error adding ${type}:`, error);
        return { success: false, message: `Failed to add ${type}.` };
    }
}

export async function deleteAttachmentAction({ taskId, attachmentId, type }: { taskId: string, attachmentId: string, type: 'photo' | 'document' }) {
    try {
        const { tasks } = await localApi.getTasks({ limit: 9999 });
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
            return { success: false, message: "Attività non trovata." };
        }

        if (type === 'photo') {
            tasks[taskIndex].photos = tasks[taskIndex].photos.filter(p => p.id !== attachmentId);
        } else {
            tasks[taskIndex].documents = tasks[taskIndex].documents.filter(d => d.id !== attachmentId);
        }
        
        await writeData('tasks.json', tasks);
        revalidatePath(`/attivita/${taskId}`);
        revalidatePath(`/clienti`);
        return { success: true, message: "Allegato eliminato con successo." };
    } catch (error) {
        return { success: false, message: "Errore durante l'eliminazione dell'allegato." };
    }
}

export async function updateAttachmentAction({ taskId, attachmentId, type, data }: { taskId: string, attachmentId: string, type: 'photo' | 'document', data: { name?: string, description?: string } }) {
     try {
        const { tasks } = await localApi.getTasks({ limit: 9999 });
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
            return { success: false, message: "Attività non trovata." };
        }

        if (type === 'photo') {
            const photoIndex = tasks[taskIndex].photos.findIndex(p => p.id === attachmentId);
            if (photoIndex !== -1) {
                tasks[taskIndex].photos[photoIndex].description = data.description || tasks[taskIndex].photos[photoIndex].description;
            }
        } else {
            const docIndex = tasks[taskIndex].documents.findIndex(d => d.id === attachmentId);
            if (docIndex !== -1) {
                 tasks[taskIndex].documents[docIndex].name = data.name || tasks[taskIndex].documents[docIndex].name;
            }
        }
        
        await writeData('tasks.json', tasks);
        revalidatePath(`/attivita/${taskId}`);
        revalidatePath(`/clienti`);
        return { success: true, message: "Allegato aggiornato con successo." };
    } catch (error) {
        return { success: false, message: "Errore durante l'aggiornamento dell'allegato." };
    }
}


// --- Reminder Actions ---
export async function addReminderAction(reminderData: Omit<Reminder, 'id' | 'isCompleted'>) {
    try {
        const reminders = await localApi.getReminders();
        const newReminder: Reminder = {
            id: String(Date.now()),
            isCompleted: false,
            ...reminderData
        };
        const updatedReminders = [...reminders, newReminder];
        await writeData('reminders.json', updatedReminders);
        revalidatePath('/');
        return { success: true, reminder: newReminder };
    } catch (error) {
        console.error('Error adding reminder:', error);
        return { success: false, message: 'Failed to add reminder.' };
    }
}

export async function deleteReminderAction(id: string) {
    try {
        const reminders = await localApi.getReminders();
        const updatedReminders = reminders.filter((r: Reminder) => r.id !== id);
        if (reminders.length === updatedReminders.length) {
            return { success: false, message: 'Reminder not found.' };
        }
        await writeData('reminders.json', updatedReminders);
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error deleting reminder:', error);
        return { success: false, message: 'Failed to delete reminder.' };
    }
}
