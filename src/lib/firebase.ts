
import { initializeApp, getApp, getApps, type FirebaseOptions } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, query, where, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { firebaseConfig } from "./firebase-config";
import type { Client, Task, Technician, TaskStatus } from "./types";

// Helper function to initialize Firebase
function getFirebaseApp() {
    if (!firebaseConfig) {
        return null;
    }
    return getApps().length ? getApp() : initializeApp(firebaseConfig as FirebaseOptions);
}

// Client functions
export const getClients = async (): Promise<Client[]> => {
    const app = getFirebaseApp();
    if (!app) return [];
    const db = getFirestore(app);
    const querySnapshot = await getDocs(collection(db, "clients"));
    const clients: Client[] = [];
    querySnapshot.forEach((doc) => {
        clients.push({ id: doc.id, ...doc.data() } as Client);
    });
    return clients;
};

export const getClient = async (id: string): Promise<Client | null> => {
    const app = getFirebaseApp();
    if (!app) return null;
    const db = getFirestore(app);
    const docRef = doc(db, "clients", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Client;
    } else {
        return null;
    }
};

export const addClient = async (client: Omit<Client, 'id'>) => {
    const app = getFirebaseApp();
    if (!app) throw new Error("Firebase not configured");
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, "clients"), client);
    return docRef.id;
}

export const updateClient = async (id: string, client: Partial<Omit<Client, 'id' | 'clientCode'>>) => {
    const app = getFirebaseApp();
    if (!app) throw new Error("Firebase not configured");
    const db = getFirestore(app);
    const docRef = doc(db, "clients", id);
    await updateDoc(docRef, client);
};

export const deleteClient = async (id: string) => {
    const app = getFirebaseApp();
    if (!app) throw new Error("Firebase not configured");
    const db = getFirestore(app);
    // TODO: Add logic to delete associated tasks
    const docRef = doc(db, "clients", id);
    await deleteDoc(docRef);
};


// Technician functions
export const getTechnicians = async (): Promise<Technician[]> => {
    const app = getFirebaseApp();
    if (!app) return [];
    const db = getFirestore(app);
    const querySnapshot = await getDocs(collection(db, "technicians"));
    const technicians: Technician[] = [];
    querySnapshot.forEach((doc) => {
        technicians.push({ id: doc.id, ...doc.data() } as Technician);
    });
    return technicians;
};

export const getTechnician = async (id: string): Promise<Technician | null> => {
    const app = getFirebaseApp();
    if (!app) return null;
    const db = getFirestore(app);
    const docRef = doc(db, "technicians", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Technician;
    } else {
        return null;
    }
};

export const addTechnician = async (technician: Omit<Technician, 'id'>) => {
    const app = getFirebaseApp();
    if (!app) throw new Error("Firebase not configured");
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, "technicians"), technician);
    return docRef.id;
};


// Task functions
export const getTasks = async (): Promise<Task[]> => {
    const app = getFirebaseApp();
    if (!app) return [];
    const db = getFirestore(app);
    const querySnapshot = await getDocs(collection(db, "tasks"));
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() } as Task);
    });
    return tasks;
};

export const getTask = async (id: string): Promise<Task | null> => {
    const app = getFirebaseApp();
    if (!app) return null;
    const db = getFirestore(app);
    const docRef = doc(db, "tasks", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Task;
    } else {
        return null;
    }
};

export const getTasksByClientId = async (clientId: string): Promise<Task[]> => {
    const app = getFirebaseApp();
    if (!app) return [];
    const db = getFirestore(app);
    const q = query(collection(db, "tasks"), where("clientId", "==", clientId));
    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() } as Task);
    });
    return tasks;
}

export const getTasksByTechnicianId = async (technicianId: string): Promise<Task[]> => {
    const app = getFirebaseApp();
    if (!app) return [];
    const db = getFirestore(app);
    const q = query(collection(db, "tasks"), where("technicianId", "==", technicianId));
    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() } as Task);
    });
    return tasks;
}


export const addTask = async (task: Omit<Task, 'id'>) => {
    const app = getFirebaseApp();
    if (!app) throw new Error("Firebase not configured");
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, "tasks"), task);
    return docRef.id;
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    const app = getFirebaseApp();
    if (!app) throw new Error("Firebase not configured");
    const db = getFirestore(app);
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, { status });
};
