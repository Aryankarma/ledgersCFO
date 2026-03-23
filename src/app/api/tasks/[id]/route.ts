import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { z } from 'zod';

const updateTaskSchema = z.object({
  status: z.enum(['Pending', 'Completed']).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  due_date: z.string().transform((str) => new Date(str)).optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    const task = await Task.findByIdAndUpdate(id, validatedData, {
      new: true,
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
