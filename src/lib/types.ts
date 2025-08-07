
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Client = {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  clientCode: string;
  mapUrl: string;
  poolType?: string;
  poolDimensions?: string;
  poolVolume?: string;
  filterType?: string;
  treatmentType?: string;
};

export type Qualification = {
  id: string;
  name: string;
  expiryDate: string;
};

export type Technician = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  qualifications: Json;
};

export type TaskStatus = 'Pianificato' | 'In corso' | 'Completato';
export type TaskPriority = 'Alta' | 'Media' | 'Bassa';

export type Photo = {
  id: string;
  url: string;
  description: string;
  name: string;
};

export type Document = {
  id: string;
  name: string;
  url: string;
};

export type Task = {
  id: number;
  clientId: number;
  technicianIds: number[];
  date: string;
  time: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  photos: Json;
  documents: Json;
  notes: string;
  duration?: number; // Duration in seconds
};

export type Reminder = {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  relatedTo: "client" | "technician" | "none";
  relatedId?: string;
  isCompleted: boolean;
};

export type Attachment = Photo | Document;
