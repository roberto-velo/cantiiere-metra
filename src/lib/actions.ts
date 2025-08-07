
'use server';

import { revalidatePath } from 'next/cache';
import type { Client, Task, TaskStatus, Technician, Photo, Document, Reminder } from './types';
import { supabase } from './supabase';
import { randomUUID } from 'crypto';

const BUCKET_NAME = 'attachments';

// --- Client Actions ---
export async function addClientAction(clientData: Omit<Client, 'id'>) {
    try {
        const { data, error } = await supabase.from('clients').insert([clientData]).select().single();
        if (error) throw error;
        revalidatePath('/clienti');
        return { success: true, client: data };
    } catch (error) {
        console.error('Error adding client:', error);
        return { success: false, message: 'Failed to add client.' };
    }
}

export async function updateClientAction(id: string, clientData: Partial<Omit<Client, 'id'>>) {
    try {
        const { data, error } = await supabase.from('clients').update(clientData).eq('id', id).select().single();
        if (error) throw error;
        revalidatePath('/clienti');
        revalidatePath(`/clienti/${id}`);
        return { success: true, client: data };
    } catch (error) {
        console.error('Error updating client:', error);
        return { success: false, message: 'Failed to update client.' };
    }
}

export async function deleteClientAction(id: string) {
    try {
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (error) throw error;
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
        const { data, error } = await supabase.from('technicians').insert([technicianData]).select().single();
        if (error) throw error;
        revalidatePath('/tecnici');
        return { success: true, technician: data };
    } catch (error) {
        console.error('Error adding technician:', error);
        return { success: false, message: 'Failed to add technician.' };
    }
}

export async function updateTechnicianAction(id: string, technicianData: Partial<Omit<Technician, 'id'>>) {
    try {
        const { data, error } = await supabase.from('technicians').update(technicianData).eq('id', id).select().single();
        if (error) throw error;
        revalidatePath('/tecnici');
        revalidatePath(`/tecnici/${id}`);
        return { success: true, technician: data };
    } catch (error) {
        console.error('Error updating technician:', error);
        return { success: false, message: 'Failed to update technician.' };
    }
}

export async function deleteTechnicianAction(id: string) {
    try {
        const { error } = await supabase.from('technicians').delete().eq('id', id);
        if (error) throw error;
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
         const newTaskData = {
            ...taskData,
            photos: [],
            documents: [],
            duration: 0,
        };

        const { data, error } = await supabase.from('tasks').insert([newTaskData]).select().single();
        if (error) throw error;
        revalidatePath('/attivita');
        return { success: true, task: data };
    } catch (error) {
        console.error('Error adding task:', error);
        return { success: false, message: 'Failed to add task.' };
    }
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus) {
    try {
        const { data, error } = await supabase.from('tasks').update({ status }).eq('id', taskId).select().single();
        if (error) throw error;
        revalidatePath('/attivita');
        revalidatePath(`/attivita/${taskId}`);
        return { success: true, task: data };
    } catch (error) {
        console.error('Error updating task status:', error);
        return { success: false, message: 'Failed to update task status.' };
    }
}

export async function updateTaskDurationAction(taskId: string, duration: number) {
     try {
        const { data, error } = await supabase.from('tasks').update({ duration, status: 'Completato' }).eq('id', taskId).select().single();
        if (error) throw error;
        revalidatePath('/attivita');
        revalidatePath(`/attivita/${taskId}`);
        return { success: true, task: data };
    } catch (error) {
        console.error('Error updating task duration:', error);
        return { success: false, message: 'Failed to update task duration.' };
    }
}


export async function deleteTaskAction(id: string) {
    try {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) throw error;
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
        const { data: task, error: fetchError } = await supabase.from('tasks').select('photos, documents').eq('id', taskId).single();
        if (fetchError || !task) throw fetchError || new Error('Task not found');
        
        // Handle file upload to Supabase Storage
        const dataUrl = attachment.url;
        const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
        if (!matches) return { success: false, message: 'Invalid file format.' };
        
        const [, mimeType, base64Data] = matches;
        const fileBuffer = Buffer.from(base64Data, 'base64');
        const fileName = `${taskId}/${type}_${randomUUID()}`;
        
        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, fileBuffer, { contentType: mimeType });
            
        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

        const newAttachment = {
            id: String(Date.now()),
            name: (attachment as Document).name || fileName,
            description: (attachment as Photo).description || '',
            url: publicUrl,
        };

        if (type === 'photo') {
            const updatedPhotos = [...task.photos as Photo[], newAttachment as Photo];
            await supabase.from('tasks').update({ photos: updatedPhotos }).eq('id', taskId);
        } else {
            const updatedDocuments = [...task.documents as Document[], newAttachment as Document];
            await supabase.from('tasks').update({ documents: updatedDocuments }).eq('id', taskId);
        }

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
        const { data: task, error: fetchError } = await supabase.from('tasks').select('photos, documents').eq('id', taskId).single();
        if (fetchError || !task) throw fetchError || new Error("Attività non trovata.");

        let updatedAttachments;
        if (type === 'photo') {
            updatedAttachments = (task.photos as Photo[]).filter(p => p.id !== attachmentId);
            await supabase.from('tasks').update({ photos: updatedAttachments }).eq('id', taskId);
        } else {
            updatedAttachments = (task.documents as Document[]).filter(d => d.id !== attachmentId);
            await supabase.from('tasks').update({ documents: updatedAttachments }).eq('id', taskId);
        }
        
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
        const { data: task, error: fetchError } = await supabase.from('tasks').select('photos, documents').eq('id', taskId).single();
        if (fetchError || !task) throw fetchError || new Error("Attività non trovata.");

        if (type === 'photo') {
            const photos = task.photos as Photo[];
            const photoIndex = photos.findIndex(p => p.id === attachmentId);
            if (photoIndex !== -1) {
                photos[photoIndex].description = data.description || photos[photoIndex].description;
                 await supabase.from('tasks').update({ photos }).eq('id', taskId);
            }
        } else {
            const documents = task.documents as Document[];
            const docIndex = documents.findIndex(d => d.id === attachmentId);
            if (docIndex !== -1) {
                 documents[docIndex].name = data.name || documents[docIndex].name;
                 await supabase.from('tasks').update({ documents }).eq('id', taskId);
            }
        }
        
        revalidatePath(`/attivita/${taskId}`);
        revalidatePath(`/clienti`);
        return { success: true, message: "Allegato aggiornato con successo." };
    } catch (error) {
        console.error("Error updating attachment:", error);
        return { success: false, message: "Errore durante l'aggiornamento dell'allegato." };
    }
}


// --- Reminder Actions ---
export async function addReminderAction(reminderData: Omit<Reminder, 'id' | 'isCompleted'>) {
    try {
        const newReminder = { ...reminderData, isCompleted: false };
        const { data, error } = await supabase.from('reminders').insert([newReminder]).select().single();
        if (error) throw error;
        revalidatePath('/');
        return { success: true, reminder: data };
    } catch (error) {
        console.error('Error adding reminder:', error);
        return { success: false, message: 'Failed to add reminder.' };
    }
}

export async function deleteReminderAction(id: string) {
    try {
        const { error } = await supabase.from('reminders').delete().eq('id', id);
        if (error) throw error;
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error deleting reminder:', error);
        return { success: false, message: 'Failed to delete reminder.' };
    }
}
