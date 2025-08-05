import type { Client, Technician, Task } from './types';

export const clients: Client[] = [
  {
    id: '1',
    name: 'Mario Rossi Costruzioni S.R.L.',
    address: 'Via Roma, 1, 20121 Milano MI',
    phone: '02 12345678',
    email: 'info@rossicostruzioni.it',
    clientCode: 'MRC001',
    mapUrl: 'https://maps.google.com/maps?q=Via+Roma,+1,+20121+Milano+MI&output=embed',
  },
  {
    id: '2',
    name: 'Bianchi & Figli S.P.A.',
    address: 'Corso Vittorio Emanuele, 15, 10123 Torino TO',
    phone: '011 87654321',
    email: 'amministrazione@bianchispa.it',
    clientCode: 'BF002',
    mapUrl: 'https://maps.google.com/maps?q=Corso+Vittorio+Emanuele,+15,+10123+Torino+TO&output=embed',
  },
  {
    id: '3',
    name: 'Condominio Verdi',
    address: 'Piazza Verdi, 5, 80133 Napoli NA',
    phone: '081 11223344',
    email: 'condominioverdi@email.it',
    clientCode: 'CV003',
    mapUrl: 'https://maps.google.com/maps?q=Piazza+Verdi,+5,+80133+Napoli+NA&output=embed',
  },
];

export const technicians: Technician[] = [
  {
    id: '1',
    firstName: 'Marco',
    lastName: 'Gialli',
    phone: '333 1234567',
    role: 'Idraulico',
    qualifications: [
      { id: 'q1', name: 'Certificazione Gas', expiryDate: '2025-12-31' },
      { id: 'q2', name: 'Sicurezza Base', expiryDate: '2024-10-15' },
    ],
  },
  {
    id: '2',
    firstName: 'Lucia',
    lastName: 'Neri',
    phone: '338 7654321',
    role: 'Elettricista',
    qualifications: [
        { id: 'q3', name: 'Certificazione PES/PAV', expiryDate: '2026-01-20' },
        { id: 'q4', name: 'Sicurezza Base', expiryDate: '2024-10-15' },
    ],
  },
  {
    id: '3',
    firstName: 'Paolo',
    lastName: 'Bruni',
    phone: '347 1122334',
    role: 'Muratore',
    qualifications: [
        { id: 'q5', name: 'Ponteggi', expiryDate: '2025-06-30' },
        { id: 'q6', name: 'Sicurezza Base', expiryDate: '2024-11-22' },
    ],
  },
];

export const tasks: Task[] = [
  {
    id: '1',
    clientId: '1',
    technicianId: '1',
    date: '2024-07-28',
    time: '09:00',
    description: 'Sostituzione caldaia e controllo impianto idraulico.',
    status: 'Completato',
    priority: 'Alta',
    photos: [
        { id: 'p1', url: 'https://placehold.co/600x400.png', description: 'Prima dell\'intervento' },
        { id: 'p2', url: 'https://placehold.co/600x400.png', description: 'Caldaia installata' }
    ],
    documents: [
        { id: 'd1', name: 'Manuale_Caldaia.pdf', url: '#' },
        { id: 'd2', name: 'Certificato_Conformita.pdf', url: '#' }
    ],
    notes: 'Intervento completato senza problemi. Il cliente ha firmato il rapporto.',
  },
  {
    id: '2',
    clientId: '2',
    technicianId: '2',
    date: '2024-07-29',
    time: '14:00',
    description: 'Riparazione quadro elettrico generale e verifica dispersioni.',
    status: 'In corso',
    priority: 'Alta',
    photos: [],
    documents: [
        { id: 'd3', name: 'Schema_Elettrico.pdf', url: '#' }
    ],
    notes: 'In attesa di pezzo di ricambio. Si prevede di completare domani.',
  },
  {
    id: '3',
    clientId: '3',
    technicianId: '3',
    date: '2024-07-30',
    time: '08:30',
    description: 'Rifacimento intonaco parete esterna lato cortile.',
    status: 'Pianificato',
    priority: 'Media',
    photos: [],
    documents: [],
    notes: 'Contattare amministratore per accesso acqua.',
  },
  {
    id: '4',
    clientId: '1',
    technicianId: '2',
    date: '2024-08-01',
    time: '10:00',
    description: 'Installazione nuove prese elettriche ufficio amministrazione.',
    status: 'Pianificato',
    priority: 'Bassa',
    photos: [],
    documents: [],
    notes: '',
  }
];
