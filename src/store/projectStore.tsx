import React, {
    useCallback,
    useEffect,
    useState,
    createContext,
    useContext,
    ReactNode,
  } from 'react';
  
  // ─────────────────────────────────────────────────────────────
  // 🔷 Типы данных (импортируем из lib)
  // ─────────────────────────────────────────────────────────────
  
  import type { Project, ProjectFrontmatter } from '../lib/projects';
  
  export type { Project, ProjectFrontmatter };
  
  // Для обратной совместимости
  export interface ProjectMeta extends ProjectFrontmatter {}
  
  export interface ProjectFilters {
    categories: string[];
    status: string[];
    tags: string[];
    search: string;
    sortBy: 'newest' | 'oldest' | 'title' | 'priority';
    author?: string;
  }
  
  // ─────────────────────────────────────────────────────────────
  // 🔷 API функции (используем реальные из lib)
  // ─────────────────────────────────────────────────────────────
  
  import {
    fetchAllProjects as fetchProjectsFromLib,
    fetchProject as fetchProjectFromLib,
    createProject as createProjectFromLib,
    updateProject as updateProjectFromLib,
    deleteProject as deleteProjectFromLib,
  } from '../lib/projects';
  
  // Обёртки для совместимости
  export const fetchAllProjects = fetchProjectsFromLib;
  export const fetchProjectById = fetchProjectFromLib;
  export const createProject = createProjectFromLib;
  export const updateProject = updateProjectFromLib;
  export const deleteProject = deleteProjectFromLib;
  
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
        const projectData = {
          ...data.meta,
          title: data.meta?.title || 'Новый проект',
          description: data.meta?.description || '',
          category: data.meta?.category || 'general',
          status: data.meta?.status || 'pending',
          tags: data.meta?.tags || [],
          images: data.meta?.images || [],
          collaborators: data.meta?.collaborators || [],
          techStack: data.meta?.techStack || [],
        };
        
        const newProject = await createProjectFromLib(projectData, data.content || '');
        
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
        const updated = await updateProjectFromLib(id, {
          ...updates.meta,
          updatedAt: new Date().toISOString(),
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
        const project = projects.find(p => p.meta.id === id);
        if (!project?.sha) {
          throw new Error('SHA не найден для проекта');
        }
        await deleteProjectFromLib(id, project.sha);
        setProjects(prev => prev.filter(p => p.meta.id !== id));
        if (currentProject?.meta.id === id) {
          setCurrentProject(null);
        }
      } catch (err: any) {
        setError(err.message || 'Не удалось удалить проект');
        throw err;
      }
    }, [currentProject, projects]);
  
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