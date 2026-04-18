import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  fetchTask,
  updateTaskStatus,
  assignTask,
  unassignTask,
  Task } from
'../lib/tasks';
import { useAuth } from '../store/authStore';
import { GITHUB_CONFIG } from '../config/github';
import { statusColors, statusLabels } from '../components/TaskCard';
import { Navbar } from '../components/Navbar';
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  User,
  Calendar,
  Loader2,
  UserPlus,
  UserMinus,
  Users } from
'lucide-react';
export const TaskDetail = () => {
  const { id } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user && GITHUB_CONFIG.ADMIN_USERS.includes(user);
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  useEffect(() => {
    const loadTask = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await fetchTask(id);
        if (!data) throw new Error('Задача не найдена');
        setTask(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadTask();
  }, [id]);
  const handleStatusChange = async (newStatus: Task['meta']['status']) => {
    if (!task || !id) return;
    setIsUpdating(true);
    try {
      await updateTaskStatus(id, newStatus);
      setTask({
        ...task,
        meta: {
          ...task.meta,
          status: newStatus
        }
      });
    } catch (err: any) {
      alert(err.message || 'Ошибка при обновлении статуса');
    } finally {
      setIsUpdating(false);
    }
  };
  const handleAssign = async () => {
    if (!task || !id || !user) return;
    setIsAssigning(true);
    try {
      const updated = await assignTask(id, user);
      setTask(updated);
    } catch (err: any) {
      alert(err.message || 'Ошибка при назначении');
    } finally {
      setIsAssigning(false);
    }
  };
  const handleUnassign = async () => {
    if (!task || !id || !user) return;
    setIsAssigning(true);
    try {
      const updated = await unassignTask(id, user);
      setTask(updated);
    } catch (err: any) {
      alert(err.message || 'Ошибка при снятии назначения');
    } finally {
      setIsAssigning(false);
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>);

  }
  if (error || !task) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="p-6 bg-card border border-destructive/20 rounded-xl max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-destructive mb-2">Ошибка</h2>
          <p className="text-muted-foreground mb-6">
            {error || 'Задача не найдена'}
          </p>
          <Link to="/tasks" className="text-primary hover:underline">
            Вернуться к списку
          </Link>
        </div>
      </div>);

  }
  const { meta, content } = task;
  const assignees = meta.assignees || [];
  const isAssigned = user ? assignees.includes(user) : false;
  const canTakeTask =
  user &&
  !isAssigned && (
  meta.status === 'open' || meta.status === 'in-progress');
  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6">
          
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к списку
        </button>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Top section */}
          <div className="p-6 md:p-8 border-b border-border">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary text-secondary-foreground">
                {meta.category}
              </span>

              {isAdmin ?
              <div className="relative inline-block">
                  <select
                  value={meta.status}
                  onChange={(e) => handleStatusChange(e.target.value as any)}
                  disabled={isUpdating}
                  className={`appearance-none pl-3 pr-8 py-1 rounded-full text-sm font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${statusColors[meta.status]} ${isUpdating ? 'opacity-50' : ''}`}>
                  
                    {Object.entries(statusLabels).map(([val, label]) =>
                  <option key={val} value={val}>
                        {label}
                      </option>
                  )}
                  </select>
                  {isUpdating &&
                <Loader2 className="w-3 h-3 animate-spin absolute right-2 top-1/2 -translate-y-1/2" />
                }
                </div> :

              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[meta.status]}`}>
                
                  {statusLabels[meta.status]}
                </span>
              }
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-6">
              {meta.title}
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-border/50 bg-muted/30 rounded-lg px-4">
              <div>
                <span className="block text-xs text-muted-foreground mb-1">
                  Бюджет
                </span>
                <span className="font-bold text-green-600 dark:text-green-500 text-sm md:text-base">
                  {meta.budget}
                </span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground mb-1">
                  Дедлайн
                </span>
                <span className="font-medium flex items-center text-sm md:text-base">
                  <Clock className="w-3 h-3 mr-1 shrink-0" />{' '}
                  <span className="truncate">{meta.deadline}</span>
                </span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground mb-1">
                  Заказчик
                </span>
                <span className="font-medium flex items-center text-sm md:text-base">
                  <User className="w-3 h-3 mr-1 shrink-0" />{' '}
                  <span className="truncate">{meta.createdBy}</span>
                </span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground mb-1">
                  Размещено
                </span>
                <span className="font-medium flex items-center text-sm md:text-base">
                  <Calendar className="w-3 h-3 mr-1 shrink-0" />{' '}
                  {new Date(meta.created).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Assignees section */}
          <div className="p-6 md:p-8 border-b border-border bg-muted/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-base font-semibold flex items-center mb-3">
                  <Users className="w-4 h-4 mr-2" />
                  Исполнители ({assignees.length})
                </h3>
                {assignees.length > 0 ?
                <div className="flex flex-wrap gap-2">
                    {assignees.map((assignee) =>
                  <span
                    key={assignee}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                    
                        <User className="w-3 h-3" />
                        {assignee}
                        {isAdmin &&
                    <button
                      onClick={async () => {
                        if (!id) return;
                        setIsAssigning(true);
                        try {
                          const updated = await unassignTask(id, assignee);
                          setTask(updated);
                        } catch (err: any) {
                          alert(err.message);
                        } finally {
                          setIsAssigning(false);
                        }
                      }}
                      className="ml-1 text-primary/60 hover:text-destructive transition-colors"
                      title={`Снять ${assignee}`}>
                      
                            ×
                          </button>
                    }
                      </span>
                  )}
                  </div> :

                <p className="text-sm text-muted-foreground">
                    Пока никто не взял задачу в работу
                  </p>
                }
              </div>

              <div className="shrink-0 w-full sm:w-auto">
                {!user ?
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent transition-colors">
                  
                    Войдите, чтобы взять задачу
                  </Link> :
                isAssigned ?
                <button
                  onClick={handleUnassign}
                  disabled={isAssigning}
                  className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 text-sm font-medium rounded-md border border-destructive/30 text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors disabled:opacity-50">
                  
                    {isAssigning ?
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :

                  <UserMinus className="w-4 h-4 mr-2" />
                  }
                    Отказаться от задачи
                  </button> :
                canTakeTask ?
                <button
                  onClick={handleAssign}
                  disabled={isAssigning}
                  className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-2.5 text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50">
                  
                    {isAssigning ?
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :

                  <UserPlus className="w-4 h-4 mr-2" />
                  }
                    Взять в работу
                  </button> :

                <span className="block text-center sm:inline-block text-sm text-muted-foreground italic">
                    Задача {statusLabels[meta.status].toLowerCase()}
                  </span>
                }
              </div>
            </div>
          </div>

          {/* Content section */}
          <div className="p-6 md:p-8">
            <h3 className="text-lg font-semibold mb-4">Описание задачи</h3>
            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground">
              {content}
            </div>

            <div className="mt-10 pt-6 border-t border-border flex justify-center">
              <a
                href={meta.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors shadow-sm w-full md:w-auto">
                
                Перейти к выполнению
                <ExternalLink className="w-5 h-5 ml-2" />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>);

};