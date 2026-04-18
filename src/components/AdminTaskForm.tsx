import React, { useState } from 'react';
import { createTask } from '../lib/tasks';
import { useAuth } from '../store/authStore';
import { Loader2 } from 'lucide-react';
import { useTasks } from '../store/taskStore';
import { sanitizeInput } from '../lib/security';
const CATEGORIES = [
'Дизайн',
'Разработка и IT',
'Тексты и переводы',
'SEO и трафик',
'Соцсети и маркетинг',
'Аудио, видео, съемка',
'Бизнес и жизнь'];

export const AdminTaskForm = ({ onSuccess }: {onSuccess?: () => void;}) => {
  const { user } = useAuth();
  const { refreshTasks } = useTasks();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    budget: '',
    externalUrl: '',
    deadline: '',
    content: ''
  });
  const handleChange = (
  e: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>

  {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await createTask(
        {
          title: sanitizeInput(formData.title),
          category: formData.category,
          budget: sanitizeInput(formData.budget),
          status: 'open',
          externalUrl: sanitizeInput(formData.externalUrl),
          createdBy: user || 'admin',
          deadline: sanitizeInput(formData.deadline)
        },
        sanitizeInput(formData.content)
      );
      setFormData({
        title: '',
        category: CATEGORIES[0],
        budget: '',
        externalUrl: '',
        deadline: '',
        content: ''
      });
      await refreshTasks();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Не удалось создать задачу');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-card p-6 rounded-xl border border-border">
      
      <h3 className="text-xl font-semibold mb-4">Создать новую задачу</h3>

      {error &&
      <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
          {error}
        </div>
      }

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Название задачи
          </label>
          <input
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 text-base bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Например: Разработать лендинг на React" />
          
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Рубрика</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 text-base bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              
              {CATEGORIES.map((c) =>
              <option key={c} value={c}>
                  {c}
                </option>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Бюджет</label>
            <input
              required
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="w-full px-3 py-2 text-base bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Например: 5 000 ₽" />
            
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Внешняя ссылка (URL)
            </label>
            <input
              required
              type="url"
              name="externalUrl"
              value={formData.externalUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 text-base bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://..." />
            
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Дедлайн</label>
            <input
              required
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-3 py-2 text-base bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Например: 3 дня" />
            
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Описание задачи
          </label>
          <textarea
            required
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={5}
            className="w-full px-3 py-2 text-base bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            placeholder="Подробное описание задачи..." />
          
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
        
        {isLoading ?
        <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Создание...
          </> :

        'Создать задачу'
        }
      </button>
    </form>);

};