import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { GITHUB_CONFIG } from '../config/github';
import { AdminTaskForm } from '../components/AdminTaskForm';
import { useTasks } from '../store/taskStore';
// import { deleteTask } from '../lib/tasks';
import { ArrowLeft, Trash2, ExternalLink } from 'lucide-react';
import { statusLabels, statusColors } from '../components/TaskCard';
import { Navbar } from '../components/Navbar';
export const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tasks, refreshTasks, isLoading } = useTasks();
  // const [deletingId, setDeletingId] = useState<string | null>(null);
  useEffect(() => {
    if (!user || !GITHUB_CONFIG.ADMIN_USERS.includes(user)) {
      navigate('/');
    }
  }, [user, navigate]);
  if (!user || !GITHUB_CONFIG.ADMIN_USERS.includes(user)) return null;
  // const handleDelete = async (id: string, sha?: string) => {
  //   if (!sha) return;
  //   if (!window.confirm('Вы уверены, что хотите удалить эту задачу?')) return;
  //   setDeletingId(id);
  //   try {
  //     await deleteTask(id, sha);
  //     await refreshTasks();
  //   } catch (err: any) {
  //     alert(err.message || 'Ошибка при удалении');
  //   } finally {
  //     setDeletingId(null);
  //   }
  // };
  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6">
          
          <ArrowLeft className="w-4 h-4 mr-2" />К бирже проектов
        </button>

        <h1 className="text-2xl font-bold mb-6">Панель администратора</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <AdminTaskForm />
          </div>

          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                <h3 className="font-semibold">Существующие задачи</h3>
                <span className="text-sm text-muted-foreground">
                  Всего: {tasks.length}
                </span>
              </div>

              <div className="divide-y divide-border">
                {isLoading ?
                <div className="p-8 text-center text-muted-foreground">
                    Загрузка...
                  </div> :
                tasks.length === 0 ?
                <div className="p-8 text-center text-muted-foreground">
                    Задач пока нет
                  </div> :

                tasks.map((task) =>
                <div
                  key={task.meta.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                  
                      <div className="flex-1 min-w-0">
                        <Link
                      to={`/tasks/${task.meta.id}`}
                      className="font-medium hover:text-primary truncate block mb-2">
                      
                          {task.meta.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                          <span
                        className={`px-2 py-0.5 rounded-full border ${statusColors[task.meta.status]}`}>
                        
                            {statusLabels[task.meta.status]}
                          </span>
                          <span className="font-medium">
                            {task.meta.budget}
                          </span>
                          <span>
                            {new Date(task.meta.created).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pt-2 sm:pt-0 border-t sm:border-0 border-border/50 w-full sm:w-auto justify-end">
                        <a
                      href={task.meta.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary"
                      title="Открыть внешнюю ссылку">
                      
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        {/* <button
                      onClick={() => handleDelete(task.meta.id, task.sha)}
                      disabled={deletingId === task.meta.id}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 disabled:opacity-50"
                      title="Удалить задачу">
                      
                          <Trash2 className="w-4 h-4" />
                        </button> */}
                      </div>
                    </div>
                )
                }
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>);

};