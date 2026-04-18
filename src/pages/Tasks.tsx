import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '../store/taskStore';
import { useAuth } from '../store/authStore';
import { TaskCard } from '../components/TaskCard';
import { TaskFilters } from '../components/TaskFilters';
import { GITHUB_CONFIG } from '../config/github';
import { Loader2, Plus, Filter, X } from 'lucide-react';
import { Navbar } from '../components/Navbar';
export const Tasks = () => {
  const { tasks, isLoading, error, filters } = useTasks();
  const { user } = useAuth();
  const isAdmin = user && GITHUB_CONFIG.ADMIN_USERS.includes(user);
  const [showFilters, setShowFilters] = useState(false);
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (
      filters.search &&
      !task.meta.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !task.content.toLowerCase().includes(filters.search.toLowerCase()))
      {
        return false;
      }
      if (
      filters.categories.length > 0 &&
      !filters.categories.includes(task.meta.category))
      {
        return false;
      }
      if (
      filters.status.length > 0 &&
      !filters.status.includes(task.meta.status))
      {
        return false;
      }
      return true;
    });
  }, [tasks, filters]);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="md:hidden flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">Проекты</h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
              
              {showFilters ?
              <X className="w-4 h-4 mr-2" /> :

              <Filter className="w-4 h-4 mr-2" />
              }
              {showFilters ? 'Скрыть' : 'Фильтры'}
            </button>
          </div>

          {/* Sidebar */}
          <aside
            className={`w-full md:w-64 shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
            
            <div className="sticky top-24 bg-card p-4 md:p-0 rounded-xl border border-border md:border-none md:bg-transparent mb-6 md:mb-0">
              <TaskFilters />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="hidden md:flex mb-6 items-center justify-between">
              <h1 className="text-2xl font-bold">Фриланс KPOL проектов</h1>
              <span className="text-sm text-muted-foreground">
                Найдено проектов: {filteredTasks.length}
              </span>
            </div>

            <div className="md:hidden mb-4 text-sm text-muted-foreground">
              Найдено проектов: {filteredTasks.length}
            </div>

            {isLoading ?
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Загрузка проектов...</p>
              </div> :
            error ?
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                {error}
              </div> :
            filteredTasks.length === 0 ?
            <div className="text-center py-20 bg-card rounded-xl border border-border">
                <p className="text-lg text-muted-foreground">
                  Проекты не найдены
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Попробуйте изменить параметры фильтрации
                </p>
              </div> :

            <div className="space-y-4">
                {filteredTasks.map((task) =>
              <TaskCard key={task.meta.id} task={task} />
              )}
              </div>
            }
          </div>
        </div>
      </main>
    </div>);

};