import React from 'react';
import { useProjects } from '../store/projectStore';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export const ProjectFilters = () => {
  const { filters, setFilters, getUniqueCategories, getUniqueTags } = useProjects();
  
  const categories = getUniqueCategories();
  const tags = getUniqueTags();
  const statusOptions = [
    { value: 'pending', label: '⏳ Ожидает' },
    { value: 'in-progress', label: '🔄 В работе' },
    { value: 'completed', label: '✅ Завершён' },
    { value: 'archived', label: '📦 Архив' },
  ];

  const toggleFilter = (field: 'categories' | 'status' | 'tags', value: string) => {
    setFilters(prev => {
      const current = prev[field];
      const exists = current.includes(value);
      return {
        ...prev,
        [field]: exists 
          ? current.filter(v => v !== value)
          : [...current, value]
      };
    });
  };

  const clearFilters = () => {
    setFilters(prev => ({
      ...prev,
      categories: [],
      status: [],
      tags: [],
      search: '',
    }));
  };

  const hasActiveFilters = 
    filters.categories.length > 0 || 
    filters.status.length > 0 || 
    filters.tags.length > 0 ||
    filters.search;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Поиск проектов..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Статус</h3>
          {filters.status.length > 0 && (
            <button 
              onClick={() => setFilters(prev => ({ ...prev, status: [] }))}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Сбросить
            </button>
          )}
        </div>
        <div className="space-y-2">
          {statusOptions.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.status.includes(opt.value)}
                onChange={() => toggleFilter('status', opt.value)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Категории</h3>
            {filters.categories.length > 0 && (
              <button 
                onClick={() => setFilters(prev => ({ ...prev, categories: [] }))}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Сбросить
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => toggleFilter('categories', cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  filters.categories.includes(cat)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary/30 text-secondary-foreground border-border hover:bg-secondary/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Теги
            </h3>
            {filters.tags.length > 0 && (
              <button 
                onClick={() => setFilters(prev => ({ ...prev, tags: [] }))}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Сбросить
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 10).map(tag => (
              <button
                key={tag}
                onClick={() => toggleFilter('tags', tag)}
                className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
                  filters.tags.includes(tag)
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-secondary/20 text-secondary-foreground border-border hover:bg-secondary/40'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear All */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
          Очистить все фильтры
        </button>
      )}
    </div>
  );
};