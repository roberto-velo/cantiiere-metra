export type Client = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  clientCode: string;
  mapUrl: string;
  pool?: Pool | null;
};

export type Pool = {
  type: 'Interrata' | 'Fuori terra';
  shape: 'Rettangolare' | 'Ovale' | 'Forma libera' | null;
  dimensione: string | null;
  volume: number | null; // in m³
  liner: 'PVC' | 'Piastrelle' | 'Vernice' | null;
  filtrationSystem: 'Sabbia' | 'Cartuccia' | 'Diatomee' | null;
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
  technicianId: string;
  date: string;
  time: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  photos: Photo[];
  documents: Document[];
  notes: string;
};
