import React from 'react';
import { Link } from 'react-router-dom';
import { Task } from '../lib/tasks';
import { Clock, User } from 'lucide-react';
interface TaskCardProps {
  task: Task;
}
export const statusColors = {
  open: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  'in-progress':
  'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  completed:
  'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  closed:
  'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
};
export const statusLabels = {
  open: 'Открыт',
  'in-progress': 'В работе',
  completed: 'Завершен',
  closed: 'Закрыт'
};
export const TaskCard = ({ task }: TaskCardProps) => {
  const { meta, content } = task;
  // Get a short snippet of the content
  const snippet =
  content.length > 150 ? content.substring(0, 150) + '...' : content;
  return (
    <Link
      to={`/tasks/${meta.id}`}
      className="block p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
          {meta.title}
        </h3>
        <div className="flex flex-col items-end shrink-0 ml-4">
          <span className="text-lg font-bold text-green-600 dark:text-green-500 whitespace-nowrap">
            ₽ {meta.budget}
          </span>
        </div>
      </div>

      <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
        {snippet}
      </p>

      <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 mt-auto pt-4 border-t border-border/50">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
            {meta.category}
          </span>

          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[meta.status]}`}>
            
            {statusLabels[meta.status]}
          </span>

          {meta.assignees && meta.assignees.length > 0 &&
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <User className="w-3 h-3 mr-1" />
              {meta.assignees.length} исполн.
            </span>
          }
        </div>

        <div className="flex flex-wrap items-center text-xs text-muted-foreground sm:ml-auto gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-border/30 sm:border-0">
          <div className="flex items-center">
            <User className="w-3 h-3 mr-1" />
            {meta.createdBy}
          </div>
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {meta.deadline}
          </div>
        </div>
      </div>
    </Link>);

};