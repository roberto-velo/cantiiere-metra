
'use server';

import { revalidatePath } from 'next/cache';
import type { Client, Task, TaskStatus, Technician, Photo, Document, Reminder } from './types';
import localApi from './data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9002';

async function saveData<T>(file: 'clients' | 'tasks' | 'technicians' | 'reminders', data: T[]): Promise<{success: boolean, message?: string}> {
    try {
        const url = `${API_BASE_URL}/api/data?file=${file}.json`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data, null, 2),
            cache: 'no-store'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to save data');
        }
        return { success: true };
    } catch(error) {
        console.error(`Error saving ${file}:`, error);
        return { success: false, message: (error as Error).message };
    }
}


// --- Client Actions ---
export async function addClientAction(clientData: Omit<Client, 'id'>) {
    try {
        const clients = await localApi.getAllClients();
        const newClient = { ...clientData, id: String(Date.now()) };
        const updatedClients = [...clients, newClient];
        
        const result = await saveData('clients', updatedClients);
        if (!result.success) throw new Error(result.message);

        revalidatePath('/clienti');
        return { success: true, client: newClient };
    } catch (error) {
        console.error('Error adding client:', error);
        return { success: false, message: (error as Error).message };
    }
}

export async function updateClientAction(id: string, clientData: Partial<Omit<Client, 'id'>>) {
    try {
        const clients = await localApi.getAllClients();
        const clientIndex = clients.findIndex(c => c.id === id);
        if (clientIndex === -1) return { success: false, message: 'Client not found.' };

        clients[clientIndex] = { ...clients[clientIndex], ...clientData };
        
        const result = await saveData('clients', clients);
        if (!result.success) throw new Error(result.message);

        revalidatePath('/clienti');
        revalidatePath(`/clienti/${id}`);
        return { success: true, client: clients[clientIndex] };
    } catch (error) {
        console.error('Error updating client:', error);
        return { success: false, message: (error as Error).message };
    }
}

export async function deleteClientAction(id: string) {
    try {
        const clients = await localApi.getAllClients();
        const updatedClients = clients.filter(c => c.id !== id);

        const result = await saveData('clients', updatedClients);
        if (!result.success) throw new Error(result.message);

        revalidatePath('/clienti');
        return { success: true, message: 'Client deleted' };
    } catch (error) {
        console.error('Error deleting client:', error);
        return { success: false, message: (error as Error).message };
    }
}


// --- Technician Actions ---
export async function addTechnicianAction(technicianData: Omit<Technician, 'id'>) {
    try {
        const technicians = await localApi.getAllTechnicians();
        const newTechnician = { ...technicianData, id: String(Date.now()) };
        const updatedTechnicians = [...technicians, newTechnician];
        
        const result = await saveData('technicians', updatedTechnicians);
        if (!result.success) throw new Error(result.message);

        revalidatePath('/tecnici');
        return { success: true, technician: newTechnician };
    } catch (error) {
        console.error('Error adding technician:', error);
        return { success: false, message: (error as Error).message };
    }
}

export async function updateTechnicianAction(id: string, technicianData: Partial<Omit<Technician, 'id'>>) {
    try {
        const technicians = await localApi.getAllTechnicians();
        const techIndex = technicians.findIndex(t => t.id === id);
        if (techIndex === -1) return { success: false, message: 'Technician not found.' };

        technicians[techIndex] = { ...technicians[techIndex], ...technicianData };
        
        const result = await saveData('technicians', technicians);
        if (!result.success) throw new Error(result.message);

        revalidatePath('/tecnici');
        revalidatePath(`/tecnici/${id}`);
        return { success: true, technician: technicians[techIndex] };
    } catch (error) {
        console.error('Error updating technician:', error);
        return { success: false, message: (error as Error).message };
    }
}

export async function deleteTechnicianAction(id: string) {
    try {
        const technicians = await localApi.getAllTechnicians();
        const updatedTechnicians = technicians.filter(t => t.id !== id);
        
        const result = await saveData('technicians', updatedTechnicians);
        if (!result.success) throw new Error(result.message);
        
        revalidatePath('/tecnici');
        return { success: true, message: 'Technician deleted' };
    } catch (error) {
        console.error('Error deleting technician:', error);
        return { success: false, message: (error as Error).message };
    }
}

// --- Task Actions ---
export async function addTaskAction(taskData: Omit<Task, 'id'>) {
    try {
        const tasks = await localApi.getTasks({ limit: 1000 }).then(res => res.tasks);
        const newTask = { ...taskData, id: String(Date.now()) };
        const updatedTasks = [...tasks, newTask];
        
        const result = await saveData('tasks', updatedTasks);
        if (!result.success) throw new Error(result.message);

        revalidatePath('/attivita');
        return { success: true, task: newTask };
    } catch (error) {
        console.error('Error adding task:', error);
        return { success: false, message: (error as Error).message };
    }
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus) {
    try {
        const tasks = await localApi.getTasks({ limit: 1000 }).then(res => res.tasks);
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return { success: false, message: 'Task not found' };

        tasks[taskIndex].status = status;
        
        const result = await saveData('tasks', tasks);
        if (!result.success) throw new Error(result.message);

        revalidatePath('/attivita');
        revalidatePath(`/attivita/${taskId}`);
        return { success: true, task: tasks[taskIndex] };
    } catch (error) {
        console.error('Error updating task status:', error);
        return { success: false, message: (error as Error).message };
    }
}

export async function updateTaskDurationAction(taskId: string, duration: number) {
     try {
        const tasks = await localApi.getTasks({ limit: 1000 }).then(res => res.tasks);
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return { success: false, message: 'Task not found' };

        tasks[taskIndex].duration = duration;
        tasks[taskIndex].status = 'Completato';

        const result = await saveData('tasks', tasks);
        if (!result.success) throw new Error(result.message);
        
        revalidatePath('/attivita');
        revalidatePath(`/attivita/${taskId}`);
        return { success: true, task: tasks[taskIndex] };
    } catch (error) {
        console.error('Error updating task duration:', error);
        return { success: false, message: (error as Error).message };
    }
}


export async function deleteTaskAction(id: string) {
    try {
        const tasks = await localApi.getTasks({ limit: 1000 }).then(res => res.tasks);
        const updatedTasks = tasks.filter(t => t.id !== id);

        const result = await saveData('tasks', updatedTasks);
        if (!result.success) throw new Error(result.message);

        revalidatePath('/attivita');
        return { success: true };
    } catch (error) {
        console.error('Error deleting task:', error);
        return { success: false, message: (error as Error).message };
    }
}


export async function addAttachmentToTaskAction(
    { taskId, attachment, type }: { taskId: string; attachment: Omit<Photo, 'id'> | Omit<Document, 'id'>; type: 'photo' | 'document' }
) {
    try {
        const tasks = await localApi.getTasks({ limit: 1000 }).then(res => res.tasks);
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) throw new Error('Task not found');
        
        // This is a mock upload. In a real app, you'd upload to a service.
        const newAttachment = {
            ...attachment,
            id: String(Date.now()),
            url: attachment.url, // In a real app, this would be the URL from the storage service
        };

        if (type === 'photo') {
            const currentPhotos = (tasks[taskIndex].photos || []) as Photo[];
            tasks[taskIndex].photos = [...currentPhotos, newAttachment as Photo];
        } else {
            const currentDocs = (tasks[taskIndex].documents || []) as Document[];
            tasks[taskIndex].documents = [...currentDocs, newAttachment as Document];
        }
        
        const result = await saveData('tasks', tasks);
        if (!result.success) throw new Error(result.message);

        revalidatePath(`/attivita/${taskId}`);
        revalidatePath(`/clienti`);
        return { success: true, attachment: newAttachment };

    } catch (error) {
        console.error(`Error adding ${type}:`, error);
        return { success: false, message: `Failed to add ${type}.` };
    }
}

export async function deleteAttachmentAction({ taskId, attachmentId, type }: { taskId: string, attachmentId: string, type: 'photo' | 'document' }) {
    try {
        const tasks = await localApi.getTasks({ limit: 1000 }).then(res => res.tasks);
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) throw new Error("Attività non trovata.");

        if (type === 'photo') {
            tasks[taskIndex].photos = (tasks[taskIndex].photos as Photo[]).filter(p => p.id !== attachmentId);
        } else {
             tasks[taskIndex].documents = (tasks[taskIndex].documents as Document[]).filter(d => d.id !== attachmentId);
        }
        
        const result = await saveData('tasks', tasks);
        if (!result.success) throw new Error(result.message);
        
        revalidatePath(`/attivita/${taskId}`);
        revalidatePath(`/clienti`);
        return { success: true, message: "Allegato eliminato con successo." };
    } catch (error) {
        console.error("Error deleting attachment:", error);
        return { success: false, message: "Errore durante l'eliminazione dell'allegato." };
    }
}

export async function updateAttachmentAction({ taskId, attachmentId, type, data }: { taskId: string, attachmentId: string, type: 'photo' | 'document', data: { name?: string, description?: string } }) {
     try {
        const tasks = await localApi.getTasks({ limit: 1000 }).then(res => res.tasks);
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) throw new Error("Attività non trovata.");

        if (type === 'photo') {
            const photos = tasks[taskIndex].photos as Photo[];
            const photoIndex = photos.findIndex(p => p.id === attachmentId);
            if (photoIndex !== -1) {
                photos[photoIndex].description = data.description || photos[photoIndex].description;
                tasks[taskIndex].photos = photos;
            }
        } else {
            const documents = tasks[taskIndex].documents as Document[];
            const docIndex = documents.findIndex(d => d.id === attachmentId);
            if (docIndex !== -1) {
                 documents[docIndex].name = data.name || documents[docIndex].name;
                 tasks[taskIndex].documents = documents;
            }
        }
        
        const result = await saveData('tasks', tasks);
        if (!result.success) throw new Error(result.message);
        
        revalidatePath(`/attivita/${taskId}`);
        revalidatePath(`/clienti`);
        return { success: true, message: "Allegato aggiornato con successo." };
    } catch (error) {
        console.error("Error updating attachment:", error);
        return { success: false, message: "Errore durante l'aggiornamento dell'allegato." };
    }
}


// --- Reminder Actions ---
export async function addReminderAction(reminderData: Omit<Reminder, 'id'>) {
    try {
        const reminders = await localApi.getReminders();
        const newReminder = { ...reminderData, id: String(Date.now()) };
        const updatedReminders = [...reminders, newReminder];
        
        const result = await saveData('reminders', updatedReminders);
        if (!result.success) throw new Error(result.message);

        revalidatePath('/');
        return { success: true, reminder: newReminder };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

export async function deleteReminderAction(id: string) {
    try {
        const reminders = await localApi.getReminders();
        const updatedReminders = reminders.filter(r => r.id !== id);
        
        const result = await saveData('reminders', updatedReminders);
        if (!result.success) throw new Error(result.message);

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}
