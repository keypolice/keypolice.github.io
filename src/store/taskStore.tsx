import React, {
  useCallback,
  useEffect,
  useState,
  createContext,
  useContext } from
'react';
import { Task, fetchAllTasks } from '../lib/tasks';
export interface TaskFilters {
  categories: string[];
  budgetRanges: string[];
  status: string[];
  search: string;
}
interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  filters: TaskFilters;
  setFilters: React.Dispatch<React.SetStateAction<TaskFilters>>;
  refreshTasks: () => Promise<void>;
}
const TaskContext = createContext<TaskContextType | undefined>(undefined);
export const TaskProvider = ({ children }: {children: ReactNode;}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    categories: [],
    budgetRanges: [],
    status: [],
    search: ''
  });
  const refreshTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTasks = await fetchAllTasks();
      setTasks(fetchedTasks);
    } catch (err: any) {
      setError(err.message || 'Не удалось загрузить задачи');
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);
  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        error,
        filters,
        setFilters,
        refreshTasks
      }}>
      
      {children}
    </TaskContext.Provider>);

};
export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};