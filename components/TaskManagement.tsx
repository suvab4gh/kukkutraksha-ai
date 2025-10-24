'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
  Camera,
  MessageSquare,
  Calendar,
  User,
  ChevronRight,
} from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  taskType: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'Overdue';
  assignedZones: string[];
  scheduledDate: string;
  dueTime: string;
  notes?: string;
  photos?: Array<{ url: string; description?: string }>;
  checklist?: Array<{
    item: string;
    completed: boolean;
    completedAt?: string;
  }>;
  completedAt?: string;
}

interface TaskManagementProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onCompleteTask: (taskId: string) => void;
  onAddNote: (taskId: string, note: string) => void;
  onToggleChecklistItem: (taskId: string, itemIndex: number) => void;
}

export default function TaskManagement({
  tasks,
  onUpdateTask,
  onCompleteTask,
  onAddNote,
  onToggleChecklistItem,
}: TaskManagementProps) {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [noteText, setNoteText] = useState('');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'In Progress':
        return <Clock className="w-5 h-5 text-blue-600 animate-pulse" />;
      case 'Overdue':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'Pending' || task.status === 'Overdue';
    if (filter === 'in-progress') return task.status === 'In Progress';
    if (filter === 'completed') return task.status === 'Completed';
    return true;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleAddNote = (taskId: string) => {
    if (noteText.trim()) {
      onAddNote(taskId, noteText);
      setNoteText('');
    }
  };

  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending' || t.status === 'Overdue').length,
    'in-progress': tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Daily Tasks</h2>
        <p className="text-gray-600">Manage your daily poultry farm activities</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All Tasks' },
          { key: 'pending', label: 'Pending' },
          { key: 'in-progress', label: 'In Progress' },
          { key: 'completed', label: 'Completed' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              filter === key
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
            <span className="ml-2 text-xs opacity-75">({taskCounts[key as keyof typeof taskCounts]})</span>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No tasks found</p>
            <p className="text-gray-400 text-sm mt-1">All caught up!</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task._id}
              className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all"
            >
              {/* Task Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">{getStatusIcon(task.status)}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{task.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {task.taskType}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(task.scheduledDate)} {task.dueTime && `at ${task.dueTime}`}
                      </span>
                      {task.assignedZones.length > 0 && (
                        <span className="text-xs text-gray-500">
                          Zones: {task.assignedZones.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTask(selectedTask === task._id ? null : task._id)}
                  className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${selectedTask === task._id ? 'rotate-90' : ''}`} />
                </button>
              </div>

              {/* Expanded Content */}
              {selectedTask === task._id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  {/* Checklist */}
                  {task.checklist && task.checklist.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Checklist</h4>
                      <div className="space-y-2">
                        {task.checklist.map((item, index) => (
                          <label
                            key={index}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => onToggleChecklistItem(task._id, index)}
                              disabled={task.status === 'Completed'}
                              className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                            />
                            <span className={`text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                              {item.item}
                            </span>
                            {item.completedAt && (
                              <span className="text-xs text-gray-400 ml-auto">
                                {new Date(item.completedAt).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
                    {task.notes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                        <p className="text-sm text-gray-700">{task.notes}</p>
                      </div>
                    )}
                    {task.status !== 'Completed' && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Add a note..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                        <button
                          onClick={() => handleAddNote(task._id)}
                          disabled={!noteText.trim()}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Photos */}
                  {task.photos && task.photos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Photos</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {task.photos.map((photo, index) => (
                          <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={photo.url}
                              alt={photo.description || `Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {task.status !== 'Completed' && (
                    <div className="flex gap-2 pt-2">
                      {task.status === 'Pending' && (
                        <button
                          onClick={() => onUpdateTask(task._id, { status: 'In Progress' })}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Start Task
                        </button>
                      )}
                      {task.status === 'In Progress' && (
                        <button
                          onClick={() => onCompleteTask(task._id)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          Mark as Complete
                        </button>
                      )}
                      <button
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
                      >
                        <Camera className="w-5 h-5" />
                        Add Photo
                      </button>
                    </div>
                  )}

                  {/* Completion Info */}
                  {task.status === 'Completed' && task.completedAt && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-800">
                        Completed on {formatDate(task.completedAt)} at{' '}
                        {new Date(task.completedAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
