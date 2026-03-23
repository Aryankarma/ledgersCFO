'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { format, isBefore } from 'date-fns';
import { 
  Users, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Plus, 
  Filter,
  ChevronRight,
  Calendar,
  Building2,
  Globe
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AddTaskForm from '../components/AddTaskForm';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Client {
  _id: string;
  company_name: string;
  country: string;
  entity_type: string;
}

interface Task {
  _id: string;
  client_id: string;
  title: string;
  description: string;
  category: string;
  due_date: string;
  status: 'Pending' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
}

export default function Dashboard() {
  return <DashboardContent />;
}

function DashboardContent() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch Clients
  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await axios.get('/api/clients');
      return res.data;
    },
  });

  // Fetch Tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['tasks', selectedClientId],
    queryFn: async () => {
      if (!selectedClientId) return [];
      const res = await axios.get(`/api/tasks?clientId=${selectedClientId}`);
      return res.data;
    },
    enabled: !!selectedClientId,
  });

  // Update Task Status Mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      await axios.patch(`/api/tasks/${taskId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', selectedClientId] });
    },
  });

  const filteredTasks = tasks?.filter((task) => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const categories = Array.from(new Set(tasks?.map((t) => t.category) || []));

  const selectedClient = clients?.find(c => c._id === selectedClientId);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar - Client List */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">LedgersCFO</h1>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Client Management</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {clientsLoading ? (
            <div className="flex flex-col gap-3 p-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            clients?.map((client) => (
              <button
                key={client._id}
                onClick={() => setSelectedClientId(client._id)}
                className={cn(
                  "w-full text-left p-4 rounded-xl transition-all duration-200 group relative",
                  selectedClientId === client._id
                    ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                    : "hover:bg-gray-50 text-gray-600 border border-transparent"
                )}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-blue-600 transition-colors">
                      {client.company_name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs opacity-70">
                      <Globe className="w-3 h-3" />
                      <span>{client.country}</span>
                      <span className="mx-1">•</span>
                      <span>{client.entity_type}</span>
                    </div>
                  </div>
                  {selectedClientId === client._id && (
                    <ChevronRight className="w-4 h-4 text-blue-500" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main Content - Task List */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50/50">
        {selectedClientId ? (
          <>
            {/* Header */}
            <header className="bg-white border-b border-gray-200 p-8 shadow-sm">
              <div className="max-w-5xl mx-auto flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Active Client</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    {selectedClient?.company_name}
                  </h2>
                </div>
                <button 
                  onClick={() => setIsAddTaskOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  New Task
                </button>
              </div>
            </header>

            {isAddTaskOpen && (
              <AddTaskForm 
                clientId={selectedClientId} 
                onClose={() => setIsAddTaskOpen(false)} 
              />
            )}

            {/* Filters */}
            <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
              <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Filters</span>
                </div>
                
                <div className="flex gap-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-gray-200 text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-white border border-gray-200 text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="ml-auto text-xs font-medium text-gray-400">
                  Showing {filteredTasks?.length || 0} tasks
                </div>
              </div>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-5xl mx-auto space-y-4">
                {tasksLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-24 bg-white animate-pulse rounded-2xl border border-gray-100" />
                    ))}
                  </div>
                ) : filteredTasks?.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No tasks found</h3>
                    <p className="text-gray-500 text-sm">Try adjusting your filters or create a new task.</p>
                  </div>
                ) : (
                  filteredTasks?.map((task) => {
                    const isOverdue = isBefore(new Date(task.due_date), new Date()) && task.status === 'Pending';
                    
                    return (
                      <div
                        key={task._id}
                        className={cn(
                          "group bg-white p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5",
                          isOverdue ? "border-red-200 bg-red-50/30" : "border-gray-100 hover:border-blue-100"
                        )}
                      >
                        <div className="flex items-center gap-6">
                          <button
                            onClick={() => updateTaskMutation.mutate({
                              taskId: task._id,
                              status: task.status === 'Pending' ? 'Completed' : 'Pending'
                            })}
                            className={cn(
                              "shrink-0 transition-transform active:scale-90",
                              task.status === 'Completed' ? "text-green-500" : "text-gray-300 hover:text-blue-500"
                            )}
                          >
                            {task.status === 'Completed' ? (
                              <CheckCircle2 className="w-7 h-7" />
                            ) : (
                              <Circle className="w-7 h-7" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className={cn(
                                "font-bold text-lg truncate transition-colors",
                                task.status === 'Completed' ? "text-gray-400 line-through" : "text-gray-900 group-hover:text-blue-600"
                              )}>
                                {task.title}
                              </h3>
                              {isOverdue && (
                                <span className="flex items-center gap-1 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full animate-pulse">
                                  <AlertCircle className="w-3 h-3" />
                                  Overdue
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-1 mb-3">{task.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">
                                <Calendar className="w-3.5 h-3.5" />
                                {format(new Date(task.due_date), 'MMM d, yyyy')}
                              </div>
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2.5 py-1 bg-gray-50 rounded-lg">
                                {task.category}
                              </span>
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg",
                                task.priority === 'High' ? "bg-orange-100 text-orange-700" :
                                task.priority === 'Medium' ? "bg-blue-100 text-blue-700" :
                                "bg-gray-100 text-gray-600"
                              )}>
                                {task.priority} Priority
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white/30">
            <div className="max-w-md text-center">
              <div className="bg-blue-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Users className="w-12 h-12 text-blue-500" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Welcome to LedgersCFO</h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                Select a client from the sidebar to view and manage their compliance tasks, filings, and deadlines.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
