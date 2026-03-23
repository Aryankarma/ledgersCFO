import dbConnect from './src/lib/mongodb';
import Client from './src/models/Client';
import Task from './src/models/Task';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const clients = [
  {
    company_name: 'TechCorp Solutions',
    country: 'USA',
    entity_type: 'Corporation',
  },
  {
    company_name: 'Green Energy Ltd',
    country: 'UK',
    entity_type: 'Private Limited',
  },
  {
    company_name: 'Global Logistics Inc',
    country: 'Canada',
    entity_type: 'Corporation',
  },
];

async function seed() {
  try {
    await dbConnect();
    console.log('Connected to MongoDB');

    // Clear existing data
    await Client.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing data');

    // Insert clients
    const createdClients = await Client.insertMany(clients);
    console.log(`Inserted ${createdClients.length} clients`);

    // Insert some initial tasks for the first client
    const tasks = [
      {
        client_id: createdClients[0]._id,
        title: 'Annual Tax Filing',
        description: 'File annual corporate tax returns',
        category: 'Tax',
        due_date: new Date('2026-03-31'),
        status: 'Pending',
        priority: 'High',
      },
      {
        client_id: createdClients[0]._id,
        title: 'Quarterly VAT Return',
        description: 'Submit VAT return for Q1',
        category: 'Tax',
        due_date: new Date('2026-03-15'), // Overdue
        status: 'Pending',
        priority: 'Medium',
      },
      {
        client_id: createdClients[1]._id,
        title: 'Employee Payroll',
        description: 'Process monthly payroll for employees',
        category: 'Payroll',
        due_date: new Date('2026-03-25'),
        status: 'Pending',
        priority: 'High',
      },
    ];

    await Task.insertMany(tasks);
    console.log(`Inserted ${tasks.length} tasks`);

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
