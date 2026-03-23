'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { X, Plus, Calendar, Tag, AlertCircle, Type, AlignLeft } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AddTaskFormProps {
  clientId: string;
  onClose: () => void;
}

export default function AddTaskForm({ clientId, onClose }: AddTaskFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Tax',
    due_date: '',
    priority: 'Medium',
    status: 'Pending',
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      await axios.post('/api/tasks', { ...data, client_id: clientId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', clientId] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create New Task</h2>
            <p className="text-sm text-gray-500 font-medium">Add a compliance requirement for this client.</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 hover:bg-white hover:shadow-md rounded-xl transition-all text-gray-400 hover:text-gray-900 active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Type className="w-3.5 h-3.5" />
              Task Title
            </label>
            <input
              required
              type="text"
              placeholder="e.g., Annual VAT Filing"
              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium placeholder:text-gray-300"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <AlignLeft className="w-3.5 h-3.5" />
              Description
            </label>
            <textarea
              placeholder="Provide context for this task..."
              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all min-h-[100px] resize-none font-medium placeholder:text-gray-300"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" />
                Category
              </label>
              <select
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium appearance-none cursor-pointer"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Tax">Tax</option>
                <option value="Filing">Filing</option>
                <option value="Payroll">Payroll</option>
                <option value="Audit">Audit</option>
                <option value="Legal">Legal</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Due Date
              </label>
              <input
                required
                type="date"
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium cursor-pointer"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5" />
              Priority Level
            </label>
            <div className="flex gap-3">
              {['Low', 'Medium', 'High'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: p })}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2",
                    formData.priority === p
                      ? p === 'High' ? "bg-orange-50 border-orange-500 text-orange-700 shadow-sm" :
                        p === 'Medium' ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm" :
                        "bg-gray-50 border-gray-900 text-gray-900 shadow-sm"
                      : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              disabled={createTaskMutation.isPending}
              type="submit"
              className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {createTaskMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
