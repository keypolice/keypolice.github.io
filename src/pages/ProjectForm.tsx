// src/pages/ProjectForm.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { useProjects, ProjectFrontmatter } from '../store/projectStore';
import { GITHUB_CONFIG } from '../config/github';
import { 
  ArrowLeft, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  ExternalLink,
  Loader2,
  Image as ImageIcon,
  Tag as TagIcon,
  Users,
  Code,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Navbar } from '../components/Navbar';

// ─────────────────────────────────────────────────────────────
// 🔷 Типы формы
// ─────────────────────────────────────────────────────────────

interface FormState extends Omit<ProjectFrontmatter, 'id' | 'createdAt' | 'updatedAt'> {
  content: string;
  images: string[];
  tags: string[];
  collaborators: string[];
  techStack: string[];
}

interface FormErrors {
  [key: string]: string;
}

const initialFormState: FormState = {
  title: '',
  description: '',
  category: '',
  status: 'pending',
  author: '',
  authorAvatar: '',
  tags: [],
  githubUrl: '',
  liveUrl: '',
  budget: '',
  deadline: '',
  priority: 'medium',
  images: [],
  thumbnail: '',
  collaborators: [],
  techStack: [],
  content: '',
};

// ─────────────────────────────────────────────────────────────
// 🔷 Компонент формы
// ─────────────────────────────────────────────────────────────

export const ProjectForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const { user } = useAuth();
  const { 
    getProjectById, 
    createNewProject, 
    updateExistingProject,
    isLoading,
    isSaving,
    error 
  } = useProjects();
  
  const navigate = useNavigate();
  
  // Состояния формы
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [newTag, setNewTag] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newCollab, setNewCollab] = useState('');
  const [newTech, setNewTech] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────
  // 🔹 Загрузка данных при редактировании
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    // Проверка прав администратора
    if (!user || !GITHUB_CONFIG.ADMIN_USERS.includes(user)) {
      navigate('/projects');
      return;
    }

      const project = getProjectById(id);
      if (project) {
        const { createdAt, updatedAt, ...meta } = project.meta;
        setFormData({
          ...meta,
          content: project.content,
          images: project.meta.images || [],
          tags: project.meta.tags || [],
          collaborators: project.meta.collaborators || [],
          techStack: project.meta.techStack || [],
        });
      }
  }, [id, isEditMode, user, navigate, getProjectById]);

  // ─────────────────────────────────────────────────────────
  // 🔹 Обработчики изменений полей
  // ─────────────────────────────────────────────────────────
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleContentChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, content: value }));
  }, []);

  // ─────────────────────────────────────────────────────────
  // 🔹 Управление массивами (теги, изображения и т.д.)
  // ─────────────────────────────────────────────────────────
  const addToArray = useCallback((field: keyof FormState, value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (!value.trim()) return;
    
    setFormData(prev => {
      const current = prev[field] as string[] || [];
      if (current.includes(value.trim())) return prev;
      return { ...prev, [field]: [...current, value.trim()] };
    });
    setter('');
  }, []);

  const removeFromArray = useCallback((field: keyof FormState, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[] || []).filter(item => item !== value)
    }));
  }, []);

  // ─────────────────────────────────────────────────────────
  // 🔹 Валидация
  // ─────────────────────────────────────────────────────────
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Название проекта обязательно';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Категория обязательна';
    }
    if (formData.githubUrl && !/^https?:\/\/.+/.test(formData.githubUrl)) {
      newErrors.githubUrl = 'Неверный формат URL';
    }
    if (formData.liveUrl && !/^https?:\/\/.+/.test(formData.liveUrl)) {
      newErrors.liveUrl = 'Неверный формат URL';
    }
    if (formData.deadline && isNaN(new Date(formData.deadline).getTime())) {
      newErrors.deadline = 'Неверная дата';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // ─────────────────────────────────────────────────────────
  // 🔹 Отправка формы
  // ─────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!validate()) return;

    try {
      if (isEditMode && id) {
        await updateExistingProject(id, {
          meta: formData,
          content: formData.content,
        });
      } else {
        await createNewProject({
          meta: formData,
          content: formData.content,
        });
      }
      navigate(`/projects/${isEditMode ? id : ''}`);
    } catch (err: any) {
      console.error('Ошибка сохранения:', err);
      setSubmitError(err.message || 'Не удалось сохранить проект');
    }
  }, [formData, isEditMode, id, validate, createNewProject, updateExistingProject, navigate]);

  // ─────────────────────────────────────────────────────────
  // 🔹 Отмена
  // ─────────────────────────────────────────────────────────
  const handleCancel = useCallback(() => {
    navigate(isEditMode ? `/projects/${id}` : '/projects');
  }, [navigate, isEditMode, id]);

  // ─────────────────────────────────────────────────────────
  // 🔹 Рендеринг поля ввода с ошибкой
  // ─────────────────────────────────────────────────────────
  const renderField = (
    label: string,
    name: keyof FormState,
    type: string = 'text',
    options?: { placeholder?: string; required?: boolean; multiline?: boolean; options?: string[] }
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {options?.required && <span className="text-destructive ml-1">*</span>}
      </label>
      
      {options?.multiline ? (
        <textarea
          name={name}
          value={formData[name] as string || ''}
          onChange={handleChange}
          placeholder={options.placeholder}
          rows={4}
          className={`w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
            errors[name] ? 'border-destructive' : 'border-border'
          }`}
        />
      ) : options?.options ? (
        <select
          name={name}
          value={formData[name] as string || ''}
          onChange={handleChange}
          className={`w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
            errors[name] ? 'border-destructive' : 'border-border'
          }`}
        >
          <option value="">Выберите...</option>
          {options.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name] as string || ''}
          onChange={handleChange}
          placeholder={options?.placeholder}
          className={`w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
            errors[name] ? 'border-destructive' : 'border-border'
          }`}
        />
      )}
      
      {errors[name] && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {errors[name]}
        </p>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────
  // 🔹 Рендеринг чипсов для массивов
  // ─────────────────────────────────────────────────────────
  const renderChipsInput = (
    label: string,
    field: keyof FormState,
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    placeholder: string,
    Icon: React.ElementType
  ) => {
    const items = formData[field] as string[] || [];
    
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          {label}
        </label>
        
        <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-border bg-background min-h-12">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
            >
              {item}
              <button
                type="button"
                onClick={() => removeFromArray(field, item)}
                className="hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {items.length === 0 && (
            <span className="text-sm text-muted-foreground">{placeholder}</span>
          )}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addToArray(field, value, setValue);
              }
            }}
            placeholder="Введите и нажмите Enter"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <button
            type="button"
            onClick={() => addToArray(field, value, setValue)}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Добавить
          </button>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────
  // 🔹 Основной рендер
  // ─────────────────────────────────────────────────────────
  if (!user || !GITHUB_CONFIG.ADMIN_USERS.includes(user)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isEditMode ? 'К проекту' : 'К списку проектов'}
          </button>
          
          <div className="flex items-center gap-3">
            {isEditMode && (
              <Link
                to={`/projects/${id}`}
                target="_blank"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-border hover:bg-secondary/50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Предпросмотр
              </Link>
            )}
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {isEditMode ? 'Редактирование проекта' : 'Новый проект'}
        </h1>
        <p className="text-muted-foreground mb-8">
          {isEditMode 
            ? 'Внесите изменения в информацию о проекте' 
            : 'Заполните данные для создания нового проекта'}
        </p>

        {/* Error Banner */}
        {(submitError || error) && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Ошибка</p>
              <p className="text-sm text-destructive/80">{submitError || error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка — Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            {/* Базовые поля */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">1</span>
                Основная информация
              </h2>
              
              {renderField('Название проекта *', 'title', 'text', { 
                placeholder: 'Например: Система управления задачами',
                required: true 
              })}
              
              {renderField('Краткое описание *', 'description', 'text', { 
                placeholder: 'Опишите проект в 1-2 предложениях',
                required: true,
                multiline: true 
              })}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderField('Категория *', 'category', 'text', { 
                  placeholder: 'web-app, mobile, design...',
                  required: true,
                  options: ['web-app', 'mobile', 'design', 'backend', 'devops', 'other']
                })}
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Статус <span className="text-destructive">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="pending">⏳ На рассмотрении</option>
                    <option value="in-progress">🔄 В работе</option>
                    <option value="completed">✅ Завершён</option>
                    <option value="archived">📦 Архив</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Приоритет
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="low">🟢 Низкий</option>
                    <option value="medium">🟡 Средний</option>
                    <option value="high">🔴 Высокий</option>
                  </select>
                </div>
                
                {renderField('Автор', 'author', 'text', { 
                  placeholder: 'GitHub username' 
                })}
              </div>
            </div>

            {/* Контент проекта (Markdown) */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">2</span>
                Описание проекта
              </h2>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground flex items-center gap-2">
                  <Code className="w-4 h-4 text-muted-foreground" />
                  Контент (Markdown) *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder={`## Описание\n\nОпишите детали проекта...\n\n## Технологии\n\`\`\`\n• React\n• Node.js\n\`\`\``}
                  rows={20}
                  className={`w-full px-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
                    errors.content ? 'border-destructive' : 'border-border'
                  }`}
                />
                <p className="text-xs text-muted-foreground">
                  Поддерживается Markdown синтаксис. Используйте ## для заголовков, **жирный**, *курсив*, `код`, - списки.
                </p>
              </div>
            </div>

            {/* Теги и технологии */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">3</span>
                Метаданные
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderChipsInput(
                  'Теги',
                  'tags',
                  newTag,
                  setNewTag,
                  'Нажмите Enter для добавления',
                  TagIcon
                )}
                
                {renderChipsInput(
                  'Технологии',
                  'techStack',
                  newTech,
                  setNewTech,
                  'React, TypeScript...',
                  Code
                )}
              </div>
              
              {renderChipsInput(
                'Коллабораторы',
                'collaborators',
                newCollab,
                setNewCollab,
                'GitHub usernames',
                Users
              )}
            </div>
          </div>

          {/* Правая колонка — Настройки и медиа */}
          <div className="space-y-6">
            {/* Ссылки */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h2 className="font-semibold text-lg">🔗 Ссылки</h2>
              
              {renderField('GitHub репозиторий', 'githubUrl', 'url', { 
                placeholder: 'https://github.com/user/repo' 
              })}
              
              {renderField('Live демо', 'liveUrl', 'url', { 
                placeholder: 'https://project.example.com' 
              })}
            </div>

            {/* Бюджет и дедлайн */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h2 className="font-semibold text-lg">💰 Детали</h2>
              
              {renderField('Бюджет', 'budget', 'text', { 
                placeholder: '150 000 ₽',
                icon: DollarSign
              })}
              
              {renderField('Дедлайн', 'deadline', 'date', { 
                placeholder: '2024-12-31' 
              })}
            </div>

            {/* Изображения */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                Медиа
              </h2>
              
              {renderField('URL обложки', 'thumbnail', 'url', { 
                placeholder: 'https://.../thumbnail.jpg' 
              })}
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">
                  Дополнительные изображения
                </label>
                
                <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-border bg-background min-h-12">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img 
                        src={img} 
                        alt="" 
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeFromArray('images', img)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {formData.images.length === 0 && (
                    <span className="text-sm text-muted-foreground self-center">Нет изображений</span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('images', newImage, setNewImage);
                      }
                    }}
                    placeholder="URL изображения"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('images', newImage, setNewImage)}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="sticky bottom-6 space-y-3">
              <button
                type="submit"
                disabled={isSaving || isLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditMode ? 'Сохранить изменения' : 'Создать проект'}
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-border rounded-xl hover:bg-secondary/50 transition-colors font-medium text-muted-foreground disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Отмена
              </button>
              
              {isEditMode && (
                <button
                  type="button"
                  disabled={isSaving}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-destructive/30 text-destructive rounded-xl hover:bg-destructive/10 transition-colors font-medium disabled:opacity-50"
                  onClick={() => {
                    if (window.confirm('Вы уверены, что хотите удалить этот проект?')) {
                      // TODO: Implement delete logic
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Удалить проект
                </button>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};