
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataDir = path.join(process.cwd(), 'src', 'lib', 'db');

async function getHandler(request: Request) {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get('file');

    if (!file || !['clients.json', 'tasks.json', 'technicians.json', 'reminders.json'].includes(file)) {
        return NextResponse.json({ message: 'Invalid file specified' }, { status: 400 });
    }

    try {
        const filePath = path.join(dataDir, file);
        const data = await fs.readFile(filePath, 'utf-8');
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
         if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
             return NextResponse.json([]);
         }
        console.error(`Error reading ${file}:`, error);
        return NextResponse.json({ message: `Error reading data from ${file}` }, { status: 500 });
    }
}


async function postHandler(request: Request) {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get('file');

     if (!file || !['clients.json', 'tasks.json', 'technicians.json', 'reminders.json'].includes(file)) {
        return NextResponse.json({ message: 'Invalid file specified' }, { status: 400 });
    }
    
    try {
        const body = await request.json();
        const filePath = path.join(dataDir, file);
        await fs.writeFile(filePath, JSON.stringify(body, null, 2), 'utf-8');
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error(`Error writing to ${file}:`, error);
        return NextResponse.json({ message: `Error writing data to ${file}` }, { status: 500 });
    }
}

export { getHandler as GET, postHandler as POST };
