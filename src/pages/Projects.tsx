// src/pages/Projects.tsx
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../store/projectStore'; // 🔹 Новый store
import { useAuth } from '../store/authStore';
import { ProjectCard } from '../components/ProjectCard'; // 🔹 Переименован
import { ProjectFilters } from '../components/ProjectFilters'; // 🔹 Переименован
import { GITHUB_CONFIG } from '../config/github';
import { Loader2, Plus, Filter, X, Grid3X3 } from 'lucide-react';
import { Navbar } from '../components/Navbar';

export const Projects = () => {
  // 🔹 Обновлённые переменные из projectStore
  const { 
    projects,           // вместо tasks
    isLoading, 
    error, 
    filters, 
    setFilters,         // 🔹 добавлено для управления фильтрами
    getFilteredProjects // 🔹 готовая функция фильтрации
  } = useProjects();
  
  const { user } = useAuth();
  const isAdmin = user && GITHUB_CONFIG.ADMIN_USERS.includes(user);
  const [showFilters, setShowFilters] = useState(false);

  // 🔹 Используем готовую фильтрацию из store (оптимизировано)
  const filteredProjects = useMemo(() => {
    return getFilteredProjects();
  }, [projects, filters, getFilteredProjects]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Галерея проектов</h1>
            <p className="hidden text-muted-foreground mt-1">
              Исследуйте проекты, фильтруйте по категориям и статусам
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Найдено проектов: {filteredProjects.length} <span className="hidden font-semibold text-foreground">{filteredProjects.length}</span>
            </span>
            
            {isAdmin && (
              <Link
                to="/projects/new"  // 🔹 Обновлённый путь
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Новый проект
              </Link>
            )}
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="hidden md:hidden inline-flex items-center justify-center p-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              aria-label={showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
            >
              {showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside
            className={`hidden w-full lg:w-72 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            <div className="sticky top-24 space-y-6">
              <div className="bg-card p-5 rounded-xl border border-border">
                <ProjectFilters /> {/* 🔹 Обновлённый компонент */}
              </div>
            </div>
          </aside>

          {/* Gallery Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                <p className="text-lg">Загрузка проектов...</p>
              </div>
            ) : error ? (
              <div className="p-6 bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
                <p className="font-medium">Ошибка загрузки</p>
                <p className="text-sm mt-1 opacity-80">{error}</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-24 bg-card rounded-xl border border-border">
                <Grid3X3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Проекты не найдены</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Попробуйте изменить параметры фильтрации
                </p>
              </div>
            ) : (
              /* 🔥 3-Column Responsive Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProjects.map((project) => (
                  <Link 
                    key={project.meta.id} 
                    to={`/projects/${project.meta.id}`}
                    className="block group"
                    aria-label={`Открыть проект: ${project.meta.title}`}
                  >
                    <ProjectCard  // 🔹 Обновлённый компонент
                      project={project}  // 🔹 prop: project вместо task
                      className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};