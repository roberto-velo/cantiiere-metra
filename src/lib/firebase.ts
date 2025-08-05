
import { initializeApp, getApp, getApps, type FirebaseOptions } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, query, where, setDoc, updateDoc, deleteDoc, limit, startAfter, getCountFromServer, orderBy } from "firebase/firestore";
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
export const getClients = async (lastId?: string): Promise<{ clients: Client[], lastVisibleId: string | null }> => {
    const app = getFirebaseApp();
    if (!app) return { clients: [], lastVisibleId: null };
    const db = getFirestore(app);
    const clientsRef = collection(db, "clients");
    
    let q;
    if (lastId) {
        const lastDocSnap = await getDoc(doc(db, "clients", lastId));
        q = query(clientsRef, orderBy("name"), startAfter(lastDocSnap), limit(10));
    } else {
        q = query(clientsRef, orderBy("name"), limit(10));
    }

    const querySnapshot = await getDocs(q);
    const clients: Client[] = [];
    querySnapshot.forEach((doc) => {
        clients.push({ id: doc.id, ...doc.data() } as Client);
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    return {
        clients,
        lastVisibleId: lastVisible ? lastVisible.id : null,
    };
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

export const getAllClients = async (): Promise<Client[]> => {
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
export const getTechnicians = async (lastId?: string): Promise<{ technicians: Technician[], lastVisibleId: string | null }> => {
    const app = getFirebaseApp();
    if (!app) return { technicians: [], lastVisibleId: null };
    const db = getFirestore(app);
    const techniciansRef = collection(db, "technicians");
    
    let q;
    if (lastId) {
        const lastDocSnap = await getDoc(doc(db, "technicians", lastId));
        q = query(techniciansRef, orderBy("lastName"), startAfter(lastDocSnap), limit(10));
    } else {
        q = query(techniciansRef, orderBy("lastName"), limit(10));
    }
    
    const querySnapshot = await getDocs(q);
    const technicians: Technician[] = [];
    querySnapshot.forEach((doc) => {
        technicians.push({ id: doc.id, ...doc.data() } as Technician);
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    return {
        technicians,
        lastVisibleId: lastVisible ? lastVisible.id : null,
    };
};

export const getAllTechnicians = async (): Promise<Technician[]> => {
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
export const getTasks = async (lastId?: string): Promise<{ tasks: Task[], lastVisibleId: string | null }> => {
    const app = getFirebaseApp();
    if (!app) return { tasks: [], lastVisibleId: null };
    const db = getFirestore(app);
    const tasksRef = collection(db, "tasks");

    let q;
    if (lastId) {
        const lastDocSnap = await getDoc(doc(db, "tasks", lastId));
        q = query(tasksRef, orderBy("date", "desc"), startAfter(lastDocSnap), limit(10));
    } else {
        q = query(tasksRef, orderBy("date", "desc"), limit(10));
    }

    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() } as Task);
    });
    
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    return {
        tasks,
        lastVisibleId: lastVisible ? lastVisible.id : null,
    };
};

export const getDashboardData = async () => {
    const app = getFirebaseApp();
    if (!app) return { tasks: [], technicians: [], clients: [] };
    const db = getFirestore(app);

    const [tasksSnapshot, techniciansSnapshot, clientsSnapshot] = await Promise.all([
        getDocs(query(collection(db, "tasks"), orderBy("date", "desc"), limit(5))),
        getDocs(query(collection(db, "technicians"))), // This still fetches all technicians
        getDocs(query(collection(db, "clients"))) // This still fetches all clients
    ]);

    const tasks: Task[] = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    const technicians: Technician[] = techniciansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Technician));
    const clients: Client[] = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
    
    return { tasks, technicians, clients };
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
