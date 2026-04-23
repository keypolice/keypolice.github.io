import React, {
    useCallback,
    useEffect,
    useState,
    createContext,
    useContext,
    ReactNode,
  } from 'react';
  
  // ─────────────────────────────────────────────────────────────
  // 🔷 Типы данных
  // ─────────────────────────────────────────────────────────────
  
  export interface ProjectMeta {
    id: string;
    title: string;
    description: string;
    category: string;
    status: 'completed' | 'in-progress' | 'pending' | 'archived';
    author?: string;
    authorAvatar?: string;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
    githubUrl?: string;
    liveUrl?: string;
    budget?: string;
    deadline?: string;
    priority?: 'low' | 'medium' | 'high';
    images?: string[];
    thumbnail?: string;
  }
  
  export interface Project {
    meta: ProjectMeta;
    content: string; // Markdown или HTML контент
    sections?: Array<{
      title: string;
      content: string;
      type?: 'text' | 'code' | 'image' | 'list';
    }>;
    attachments?: Array<{
      name: string;
      url: string;
      type: string;
      size?: number;
    }>;
  }
  
  export interface ProjectFilters {
    categories: string[];
    status: string[];
    tags: string[];
    search: string;
    sortBy: 'newest' | 'oldest' | 'title' | 'priority';
    author?: string;
  }
  
  // ─────────────────────────────────────────────────────────────
  // 🔷 API функции (замените на реальные запросы)
  // ─────────────────────────────────────────────────────────────
  
  const API_BASE = import.meta.env.VITE_API_URL || '/api';
  
  export const fetchAllProjects = async (): Promise<Project[]> => {
    const response = await fetch(`${API_BASE}/projects`);
    if (!response.ok) throw new Error('Не удалось загрузить проекты');
    return response.json();
  };
  
  export const fetchProjectById = async (id: string): Promise<Project | null> => {
    const response = await fetch(`${API_BASE}/projects/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Не удалось загрузить проект');
    }
    return response.json();
  };
  
  export const createProject = async (project: Partial<Project>): Promise<Project> => {
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    if (!response.ok) throw new Error('Не удалось создать проект');
    return response.json();
  };
  
  export const updateProject = async (
    id: string,
    updates: Partial<Project>
  ): Promise<Project> => {
    const response = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Не удалось обновить проект');
    return response.json();
  };
  
  export const deleteProject = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Не удалось удалить проект');
  };
  
  // ─────────────────────────────────────────────────────────────
  // 🔷 Context и типы
  // ─────────────────────────────────────────────────────────────
  
  interface ProjectContextType {
    // Данные
    projects: Project[];
    currentProject: Project | null;
    
    // Состояния
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    
    // Фильтры
    filters: ProjectFilters;
    setFilters: React.Dispatch<React.SetStateAction<ProjectFilters>>;
    
    // Действия
    refreshProjects: () => Promise<void>;
    loadProject: (id: string) => Promise<Project | null>;
    createNewProject: (data: Partial<Project>) => Promise<Project>;
    updateExistingProject: (id: string, data: Partial<Project>) => Promise<Project>;
    removeProject: (id: string) => Promise<void>;
    
    // Утилиты
    getFilteredProjects: () => Project[];
    getProjectById: (id: string) => Project | undefined;
    getUniqueCategories: () => string[];
    getUniqueTags: () => string[];
  }
  
  const ProjectContext = createContext<ProjectContextType | undefined>(undefined);
  
  // ─────────────────────────────────────────────────────────────
  // 🔷 Provider компонент
  // ─────────────────────────────────────────────────────────────
  
  export const ProjectProvider = ({ children }: { children: ReactNode }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [filters, setFilters] = useState<ProjectFilters>({
      categories: [],
      status: [],
      tags: [],
      search: '',
      sortBy: 'newest',
      author: undefined,
    });
  
    // ─────────────────────────────────────────────────────────
    // 🔹 Загрузка всех проектов
    // ─────────────────────────────────────────────────────────
    const refreshProjects = useCallback(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAllProjects();
        setProjects(data);
      } catch (err: any) {
        console.error('Ошибка загрузки проектов:', err);
        setError(err.message || 'Не удалось загрузить проекты');
      } finally {
        setIsLoading(false);
      }
    }, []);
  
    // ─────────────────────────────────────────────────────────
    // 🔹 Загрузка одного проекта
    // ─────────────────────────────────────────────────────────
    const loadProject = useCallback(async (id: string): Promise<Project | null> => {
      setError(null);
      try {
        const project = await fetchProjectById(id);
        if (project) {
          setCurrentProject(project);
          // Обновляем в списке если есть
          setProjects(prev => 
            prev.map(p => p.meta.id === id ? project : p)
          );
        }
        return project;
      } catch (err: any) {
        setError(err.message || 'Не удалось загрузить проект');
        return null;
      }
    }, []);
  
    // ─────────────────────────────────────────────────────────
    // 🔹 Создание проекта
    // ─────────────────────────────────────────────────────────
    const createNewProject = useCallback(async (data: Partial<Project>): Promise<Project> => {
      setIsSaving(true);
      setError(null);
      try {
        const newProject = await createProject({
          ...data,
          meta: {
            id: crypto.randomUUID(),
            title: data.meta?.title || 'Новый проект',
            description: data.meta?.description || '',
            category: data.meta?.category || 'general',
            status: data.meta?.status || 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...data.meta,
          } as ProjectMeta,
          content: data.content || '',
        });
        
        setProjects(prev => [newProject, ...prev]);
        return newProject;
      } catch (err: any) {
        setError(err.message || 'Не удалось создать проект');
        throw err;
      } finally {
        setIsSaving(false);
      }
    }, []);
  
    // ─────────────────────────────────────────────────────────
    // 🔹 Обновление проекта
    // ─────────────────────────────────────────────────────────
    const updateExistingProject = useCallback(async (
      id: string,
      updates: Partial<Project>
    ): Promise<Project> => {
      setIsSaving(true);
      setError(null);
      try {
        const updated = await updateProject(id, {
          ...updates,
          meta: updates.meta ? {
            ...updates.meta,
            updatedAt: new Date().toISOString(),
          } : undefined,
        });
        
        setProjects(prev => 
          prev.map(p => p.meta.id === id ? updated : p)
        );
        if (currentProject?.meta.id === id) {
          setCurrentProject(updated);
        }
        return updated;
      } catch (err: any) {
        setError(err.message || 'Не удалось обновить проект');
        throw err;
      } finally {
        setIsSaving(false);
      }
    }, [currentProject]);
  
    // ─────────────────────────────────────────────────────────
    // 🔹 Удаление проекта
    // ─────────────────────────────────────────────────────────
    const removeProject = useCallback(async (id: string): Promise<void> => {
      setError(null);
      try {
        await deleteProject(id);
        setProjects(prev => prev.filter(p => p.meta.id !== id));
        if (currentProject?.meta.id === id) {
          setCurrentProject(null);
        }
      } catch (err: any) {
        setError(err.message || 'Не удалось удалить проект');
        throw err;
      }
    }, [currentProject]);
  
    // ─────────────────────────────────────────────────────────
    // 🔹 Фильтрация и сортировка проектов
    // ─────────────────────────────────────────────────────────
    const getFilteredProjects = useCallback((): Project[] => {
      let result = [...projects];
  
      // 🔍 Поиск
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        result = result.filter(p => 
          p.meta.title.toLowerCase().includes(q) ||
          p.meta.description.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.meta.tags?.some(t => t.toLowerCase().includes(q))
        );
      }
  
      // 📁 Категории
      if (filters.categories.length > 0) {
        result = result.filter(p => filters.categories.includes(p.meta.category));
      }
  
      // 📊 Статусы
      if (filters.status.length > 0) {
        result = result.filter(p => filters.status.includes(p.meta.status));
      }
  
      // 🏷️ Теги
      if (filters.tags.length > 0) {
        result = result.filter(p => 
          p.meta.tags?.some(t => filters.tags.includes(t))
        );
      }
  
      // 👤 Автор
      if (filters.author) {
        result = result.filter(p => p.meta.author === filters.author);
      }
  
      // 🔄 Сортировка
      switch (filters.sortBy) {
        case 'oldest':
          result.sort((a, b) => new Date(a.meta.createdAt).getTime() - new Date(b.meta.createdAt).getTime());
          break;
        case 'title':
          result.sort((a, b) => a.meta.title.localeCompare(b.meta.title, 'ru'));
          break;
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          result.sort((a, b) => 
            (priorityOrder[a.meta.priority || 'low'] ?? 3) - 
            (priorityOrder[b.meta.priority || 'low'] ?? 3)
          );
          break;
        case 'newest':
        default:
          result.sort((a, b) => new Date(b.meta.createdAt).getTime() - new Date(a.meta.createdAt).getTime());
      }
  
      return result;
    }, [projects, filters]);
  
    // ─────────────────────────────────────────────────────────
    // 🔹 Утилиты
    // ─────────────────────────────────────────────────────────
    const getProjectById = useCallback((id: string): Project | undefined => {
      return projects.find(p => p.meta.id === id);
    }, [projects]);
  
    const getUniqueCategories = useCallback((): string[] => {
      return [...new Set(projects.map(p => p.meta.category))].sort();
    }, [projects]);
  
    const getUniqueTags = useCallback((): string[] => {
      const tags = projects.flatMap(p => p.meta.tags || []);
      return [...new Set(tags)].sort();
    }, [projects]);
  
    // ─────────────────────────────────────────────────────────
    // 🔹 Инициализация при монтировании
    // ─────────────────────────────────────────────────────────
    useEffect(() => {
      refreshProjects();
    }, [refreshProjects]);
  
    // ─────────────────────────────────────────────────────────
    // 🔹 Значение контекста
    // ─────────────────────────────────────────────────────────
    const value: ProjectContextType = {
      // Данные
      projects,
      currentProject,
      
      // Состояния
      isLoading,
      isSaving,
      error,
      
      // Фильтры
      filters,
      setFilters,
      
      // Действия
      refreshProjects,
      loadProject,
      createNewProject,
      updateExistingProject,
      removeProject,
      
      // Утилиты
      getFilteredProjects,
      getProjectById,
      getUniqueCategories,
      getUniqueTags,
    };
  
    return (
      <ProjectContext.Provider value={value}>
        {children}
      </ProjectContext.Provider>
    );
  };
  
  // ─────────────────────────────────────────────────────────────
  // 🔷 Custom Hook
  // ─────────────────────────────────────────────────────────────
  
  export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
      throw new Error('useProjects must be used within a ProjectProvider');
    }
    return context;
  };
  
  // ─────────────────────────────────────────────────────────────
  // 🔷 Хук для отдельного проекта (оптимизация)
  // ─────────────────────────────────────────────────────────────
  
  export const useProject = (id: string | undefined) => {
    const { getProjectById, loadProject, isLoading, error } = useProjects();
    const [isLoaded, setIsLoaded] = useState(false);
  
    const project = id ? getProjectById(id) : null;
  
    useEffect(() => {
      if (id && !project && !isLoaded) {
        loadProject(id).then(() => setIsLoaded(true));
      }
    }, [id, project, isLoaded, loadProject]);
  
    return {
      project,
      isLoading: isLoading && !project,
      error,
      refetch: () => id ? loadProject(id) : Promise.resolve(null),
    };
  };