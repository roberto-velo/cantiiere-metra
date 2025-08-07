
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Note: This is a simplified in-memory "database" for demonstration purposes.
// In a real-world application, you would use a proper database.
const dataDir = path.join(process.cwd(), 'src', 'lib', 'db');
const VALID_FILES = ['clients.json', 'tasks.json', 'technicians.json', 'reminders.json'];

async function getHandler(request: Request) {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get('file');

    if (!file || !VALID_FILES.includes(file)) {
        return NextResponse.json({ message: 'Invalid file specified' }, { status: 400 });
    }

    try {
        const filePath = path.join(dataDir, file);
        const data = await fs.readFile(filePath, 'utf-8');
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
         if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
             // If the file doesn't exist, create it with an empty array.
             const filePath = path.join(dataDir, file);
             await fs.mkdir(dataDir, { recursive: true });
             await fs.writeFile(filePath, '[]', 'utf-8');
             return NextResponse.json([]);
         }
        console.error(`Error reading ${file}:`, error);
        return NextResponse.json({ message: `Error reading data from ${file}` }, { status: 500 });
    }
}


async function postHandler(request: Request) {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get('file');

     if (!file || !VALID_FILES.includes(file)) {
        return NextResponse.json({ message: 'Invalid file specified' }, { status: 400 });
    }
    
    try {
        const body = await request.json();
        const filePath = path.join(dataDir, file);
        // Ensure the directory exists.
        await fs.mkdir(dataDir, { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(body, null, 2), 'utf-8');
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error(`Error writing to ${file}:`, error);
        return NextResponse.json({ message: `Error writing data to ${file}` }, { status: 500 });
    }
}

export { getHandler as GET, postHandler as POST };
