// src/components/ProjectCard.tsx
import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../store/projectStore';
import { Calendar, Tag, ExternalLink, Github, ArrowRight } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  className?: string;
}

export const ProjectCard = memo(({ project, className = '' }: ProjectCardProps) => {
  const { meta } = project;
  
  // 🔹 Статус бейджи
  const statusConfig = {
    'completed': { bg: 'bg-green-500/10', text: 'text-green-600', label: '✅ Завершён' },
    'in-progress': { bg: 'bg-blue-500/10', text: 'text-blue-600', label: '🔄 В работе' },
    'pending': { bg: 'bg-yellow-500/10', text: 'text-yellow-600', label: '⏳ Ожидает' },
    'archived': { bg: 'bg-gray-500/10', text: 'text-gray-600', label: '📦 Архив' },
  };
  const status = statusConfig[meta.status] || statusConfig.pending;

  // 🔹 Приоритет индикатор
  const priorityDot = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  }[meta.priority || 'medium'];

  return (
    <article className={`group relative bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all ${className}`}>
      {/* Priority indicator */}
      <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${priorityDot} ring-2 ring-background`} 
           title={`Приоритет: ${meta.priority}`} />

      {/* Thumbnail */}
      {meta.thumbnail && (
        <div className="aspect-video overflow-hidden bg-muted/30">
          <img 
            src={meta.thumbnail} 
            alt={meta.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border mb-2 ${status.bg} ${status.text} border-transparent`}>
              {status.label}
            </span>
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {meta.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {meta.description}
        </p>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(meta.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            <span className="truncate max-w-24">{meta.category}</span>
          </div>

          {meta.budget && (
            <span className="px-2 py-0.5 rounded bg-secondary/50 text-secondary-foreground font-medium">
              {meta.budget}
            </span>
          )}
        </div>

        {/* Tags */}
        {meta.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {meta.tags.slice(0, 3).map((tag) => (
              <span 
                key={tag}
                className="px-2 py-0.5 text-xs rounded-md bg-secondary/30 text-secondary-foreground"
              >
                #{tag}
              </span>
            ))}
            {meta.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{meta.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            {meta.githubUrl && (
              <a
                href={meta.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
                title="GitHub"
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {meta.liveUrl && (
              <a
                href={meta.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
                title="Live Demo"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          
          <Link
            to={`/projects/${meta.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors group/link"
            onClick={(e) => e.stopPropagation()}
          >
            Подробнее
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
});