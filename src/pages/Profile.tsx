import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { parseFrontmatter } from '../lib/frontmatter';
import { updateUserProfileContent } from '../lib/github';
import { useTasks } from '../store/taskStore';
import { statusColors, statusLabels } from '../components/TaskCard';
import { Navbar } from '../components/Navbar';
import {
  LogOut,
  RefreshCw,
  User,
  Calendar,
  Activity,
  FileText,
  Briefcase,
  Clock,
  ExternalLink,
  Loader2,
  Pencil,
  Save,
  X,
  TrendingUp,
  BookOpen,
  HelpCircle,
  Rocket,
  CheckCircle2,
  ArrowRight } from
'lucide-react';
export const Profile = () => {
  const { user, profileData, logout } = useAuth();
  const navigate = useNavigate();
  const { tasks, isLoading: tasksLoading } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const { meta, content } = useMemo(() => {
    if (!profileData)
    return {
      meta: null,
      content: null
    };
    return parseFrontmatter(profileData);
  }, [profileData]);
  if (!user) return null;
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Неизвестно';
    try {
      return new Date(isoString).toLocaleString();
    } catch (e) {
      return isoString;
    }
  };
  const myTasks = useMemo(() => {
    if (!user) return [];
    return tasks.filter(
      (t) => t.meta.assignees && t.meta.assignees.includes(user)
    );
  }, [tasks, user]);
  const completedTasks = myTasks.filter((t) => t.meta.status === 'completed');
  const inProgressTasks = myTasks.filter((t) => t.meta.status === 'in-progress');
  const handleStartEdit = () => {
    setEditContent(content || '');
    setSaveError('');
    setIsEditing(true);
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent('');
    setSaveError('');
  };
  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveError('');
    try {
      await updateUserProfileContent(user, editContent);
      setIsEditing(false);
    } catch (err: any) {
      setSaveError(err.message || 'Ошибка при сохранении');
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-6 md:py-10 max-w-3xl">
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <User className="w-7 h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Профиль
                </h2>
                <p className="text-muted-foreground mt-1 text-sm md:text-base">
                  Вы вошли как{' '}
                  <span className="font-semibold text-foreground">@{user}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground h-10 px-4 py-2 w-full sm:w-auto">
              
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-border bg-background flex flex-col">
              <div className="flex items-center text-muted-foreground mb-2">
                <User className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Имя пользователя</span>
              </div>
              <span className="text-lg font-semibold">
                {meta?.username || user}
              </span>
            </div>
            <div className="p-4 rounded-lg border border-border bg-background flex flex-col">
              <div className="flex items-center text-muted-foreground mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Создан</span>
              </div>
              <span className="text-lg font-semibold">
                {formatDate(meta?.created)}
              </span>
            </div>
            <div className="p-4 rounded-lg border border-border bg-background flex flex-col">
              <div className="flex items-center text-muted-foreground mb-2">
                <Activity className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Статус</span>
              </div>
              <span className="text-lg font-semibold capitalize flex items-center">
                <span
                  className={`w-2 h-2 rounded-full mr-2 ${meta?.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                </span>
                {meta?.status || 'Неизвестно'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center mb-5">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            <h3 className="text-lg font-semibold">Прогресс на платформе</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myTasks.length}</p>
                <p className="text-xs text-muted-foreground">Всего задач</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressTasks.length}</p>
                <p className="text-xs text-muted-foreground">В работе</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedTasks.length}</p>
                <p className="text-xs text-muted-foreground">Завершено</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Выполнение задач</span>
              <span className="font-medium">
                {myTasks.length > 0 ?
                Math.round(completedTasks.length / myTasks.length * 100) :
                0}
                %
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{
                  width: `${myTasks.length > 0 ? completedTasks.length / myTasks.length * 100 : 0}%`
                }} />
              
            </div>
          </div>
        </div>

        {/* Quick Links / Instructions */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center mb-5">
            <BookOpen className="w-5 h-5 mr-2 text-primary" />
            <h3 className="text-lg font-semibold">Полезные ссылки</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/tasks"
              className="flex items-center gap-3 p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors group">
              
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Начать работу</p>
                <p className="text-xs text-muted-foreground">
                  Найдите свой первый проект на бирже
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </Link>

            <a
              href="#instructions-profile"
              onClick={(e) => {
                e.preventDefault();
                document.
                getElementById('instructions-profile')?.
                scrollIntoView({
                  behavior: 'smooth'
                });
              }}
              className="flex items-center gap-3 p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors group">
              
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Инструкции</p>
                <p className="text-xs text-muted-foreground">
                  Как пользоваться платформой
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </a>

            <a
              href="#progress-tasks"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('progress-tasks')?.scrollIntoView({
                  behavior: 'smooth'
                });
              }}
              className="flex items-center gap-3 p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors group">
              
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Мой прогресс</p>
                <p className="text-xs text-muted-foreground">
                  Статистика и выполненные задачи
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </a>

            <a
              href="#"
              className="flex items-center gap-3 p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors group">
              
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Помощь и FAQ</p>
                <p className="text-xs text-muted-foreground">
                  Ответы на частые вопросы
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </a>
          </div>
        </div>

        {/* My Tasks Section */}
        <div
          id="progress-tasks"
          className="bg-card border border-border rounded-xl shadow-sm p-6 md:p-8 mb-6">
          
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-primary" />
              <h3 className="text-lg font-semibold">Мои задачи</h3>
            </div>
            <Link to="/tasks" className="text-xs text-primary hover:underline">
              Все задачи →
            </Link>
          </div>

          {tasksLoading ?
          <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Загрузка задач...
            </div> :
          myTasks.length === 0 ?
          <div className="p-6 bg-muted/50 rounded-lg border border-border text-center">
              <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-1">
                Вы пока не участвуете ни в одной задаче
              </p>
              <Link
              to="/tasks"
              className="inline-block mt-2 text-sm text-primary hover:underline">
              
                Перейти к бирже проектов
              </Link>
            </div> :

          <div className="space-y-3">
              {myTasks.map((task) =>
            <Link
              key={task.meta.id}
              to={`/tasks/${task.meta.id}`}
              className="block p-4 bg-background border border-border rounded-lg hover:shadow-md transition-shadow">
              
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1 w-full">
                      <h4 className="font-semibold text-foreground truncate mb-2">
                        {task.meta.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {task.meta.category}
                        </span>
                        <span
                      className={`px-2 py-0.5 rounded-full border ${statusColors[task.meta.status]}`}>
                      
                          {statusLabels[task.meta.status]}
                        </span>
                        <span className="flex items-center text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          {task.meta.deadline}
                        </span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-border/50">
                      <span className="font-bold text-green-600 dark:text-green-500 text-sm whitespace-nowrap">
                        {task.meta.budget}
                      </span>
                      {task.meta.externalUrl &&
                  <ExternalLink className="w-3 h-3 text-muted-foreground sm:mt-1" />
                  }
                    </div>
                  </div>
                </Link>
            )}
            </div>
          }
        </div>

        {/* Instructions Section */}
        <div
          id="instructions-profile"
          className="bg-card border border-border rounded-xl shadow-sm p-6 md:p-8 mb-6">
          
          <div className="flex items-center mb-5">
            <BookOpen className="w-5 h-5 mr-2 text-primary" />
            <h3 className="text-lg font-semibold">
              Инструкции по использованию
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-border">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                1
              </div>
              <div>
                <h4 className="font-medium mb-1">Найдите подходящий проект</h4>
                <p className="text-sm text-muted-foreground">
                  Перейдите в{' '}
                  <Link to="/tasks" className="text-primary hover:underline">
                    Биржу проектов
                  </Link>{' '}
                  и используйте фильтры для поиска задач по вашей специализации
                  и бюджету.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-border">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                2
              </div>
              <div>
                <h4 className="font-medium mb-1">Возьмите задачу в работу</h4>
                <p className="text-sm text-muted-foreground">
                  Откройте карточку задачи и нажмите кнопку «Взять в работу».
                  Задача появится в разделе «Мои задачи» вашего профиля.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-border">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                3
              </div>
              <div>
                <h4 className="font-medium mb-1">Выполните и сдайте работу</h4>
                <p className="text-sm text-muted-foreground">
                  Перейдите по внешней ссылке задачи для выполнения. После
                  завершения заказчик обновит статус задачи.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-border">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                4
              </div>
              <div>
                <h4 className="font-medium mb-1">Используйте заметки</h4>
                <p className="text-sm text-muted-foreground">
                  В разделе «Заметка» ниже вы можете вести личные записи. Данные
                  синхронизируются.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary" />
              <h3 className="text-lg font-semibold">Заметка</h3>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && profileData &&
              <button
                onClick={handleStartEdit}
                className="inline-flex items-center text-xs text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-full transition-colors">
                
                  <Pencil className="w-3 h-3 mr-1" />
                  Редактировать
                </button>
              }
              {/* <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Синхронизация
              </div> */}
            </div>
          </div>

          {isEditing ?
          <div className="space-y-3">
              <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={8}
              className="w-full p-4 bg-background border border-input rounded-lg font-mono text-base focus:outline-none focus:ring-2 focus:ring-primary resize-y min-h-[200px]"
              placeholder="Напишите заметку..."
              disabled={isSaving} />
            
              {saveError &&
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                  {saveError}
                </div>
            }
              <div className="flex items-center gap-2 justify-end">
                <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent transition-colors disabled:opacity-50">
                
                  <X className="w-4 h-4 mr-1.5" />
                  Отмена
                </button>
                <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
                
                  {isSaving ?
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> :

                <Save className="w-4 h-4 mr-1.5" />
                }
                  Сохранить
                </button>
              </div>
            </div> :

          <div className="p-6 bg-muted rounded-lg border border-border overflow-auto min-h-[200px] max-h-96 whitespace-pre-wrap font-mono text-sm shadow-inner relative">
              {profileData ?
            content ||
            <span className="text-muted-foreground italic">
                    Нет записей. Нажмите «Редактировать», чтобы добавить
                    заметку.
                  </span> :


            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Загрузка...
                </div>
            }
            </div>
          }

          <div className="text-xs text-muted-foreground text-right mt-3">
            Файл: <span className="font-mono">{user}.md</span>
          </div>
        </div>
      </main>
    </div>);

};