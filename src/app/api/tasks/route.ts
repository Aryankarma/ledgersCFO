import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { z } from 'zod';

const taskSchema = z.object({
  client_id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  due_date: z.string().transform((str) => new Date(str)),
  status: z.enum(['Pending', 'Completed']).default('Pending'),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
});

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const tasks = await Task.find({ client_id: clientId }).sort({ due_date: 1 });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const validatedData = taskSchema.parse(body);
    const task = await Task.create(validatedData);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
