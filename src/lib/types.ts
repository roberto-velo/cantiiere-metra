
export type Client = {
  id: string;
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
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  qualifications: Qualification[];
};

export type TaskStatus = 'Pianificato' | 'In corso' | 'Completato';
export type TaskPriority = 'Alta' | 'Media' | 'Bassa';

export type Photo = {
  id: string;
  url: string;
  description: string;
};

export type Document = {
  id: string;
  name: string;
  url: string;
};

export type Task = {
  id: string;
  clientId: string;
  technicianIds: string[];
  date: string;
  time: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  photos: Photo[];
  documents: Document[];
  notes: string;
  duration?: number; // Duration in seconds
};

export type Reminder = {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  relatedTo: "client" | "technician" | "none";
  relatedId?: string;
  isCompleted: boolean;
};
