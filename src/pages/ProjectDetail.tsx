import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProjects } from '../store/projectStore';
import { Navbar } from '../components/Navbar';
import { TaskCard } from '../components/TaskCard';
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  ExternalLink, 
  Github, 
  Clock, 
  User,
  ChevronRight,
  Share2,
  Bookmark
} from 'lucide-react';

export const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, isLoading } = useProjects();
  
  const project = projects.find(p => p.meta.id === id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="animate-pulse space-y-4 max-w-4xl w-full">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="aspect-video bg-muted rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <span className="text-2xl">🔍</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Проект не найден</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Запрашиваемый проект не существует или был удалён
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться к проектам
          </Link>
        </div>
      </div>
    );
  }

  const { meta, content, images = [] } = project;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        
        <div className="container mx-auto px-4 py-8 md:py-12 relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/projects" className="hover:text-foreground transition-colors">
              Проекты
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium truncate max-w-[200px] md:max-w-none">
              {meta.title}
            </span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Meta */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    meta.status === 'completed' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                    meta.status === 'in-progress' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                    'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                  }`}>
                    {meta.status === 'completed' ? '✅ Завершён' : 
                     meta.status === 'in-progress' ? '🔄 В работе' : '⏳ На рассмотрении'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                    {meta.category}
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  {meta.title}
                </h1>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {meta.description || project.content.slice(0, 200)}...
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Calendar, label: 'Создан', value: new Date(meta.createdAt).toLocaleDateString('ru-RU') },
                  { icon: Clock, label: 'Обновлён', value: new Date(meta.updatedAt).toLocaleDateString('ru-RU') },
                  { icon: Tag, label: 'Категория', value: meta.category },
                  { icon: User, label: 'Автор', value: meta.author || 'KPOL Team' },
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-xl bg-card border border-border">
                    <stat.icon className="w-4 h-4 text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="font-medium text-sm truncate">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Project Content */}
              <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary hover:prose-a:underline">
                <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                  {content}
                </div>
              </article>

              {/* Tags */}
              {meta.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  {meta.tags.map((tag: string) => (
                    <span 
                      key={tag}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary/50 text-secondary-foreground border border-border hover:bg-secondary transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Image */}
              {images[0] && (
                <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
                  <img 
                    src={images[0]} 
                    alt={meta.title}
                    className="w-full aspect-video object-cover"
                  />
                </div>
              )}

              {/* Actions Card */}
              <div className="p-5 rounded-xl bg-card border border-border space-y-4">
                <h3 className="font-semibold">Действия</h3>
                
                <div className="space-y-3">
                  {meta.githubUrl && (
                    <a
                      href={meta.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#24292f] hover:bg-[#1b1f24] text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <Github className="w-4 h-4" />
                      Открыть на GitHub
                    </a>
                  )}
                  
                  {meta.liveUrl && (
                    <a
                      href={meta.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Demo
                    </a>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                    <Share2 className="w-4 h-4" />
                    Поделиться
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                    <Bookmark className="w-4 h-4" />
                    Сохранить
                  </button>
                </div>
              </div>

              {/* Related Projects */}
              <div className="p-5 rounded-xl bg-card border border-border">
                <h3 className="font-semibold mb-4">Похожие проекты</h3>
                <div className="space-y-3">
                  {projects
                    .filter(p => p.meta.id !== id && p.meta.category === meta.category)
                    .slice(0, 3)
                    .map(related => (
                      <Link
                        key={related.meta.id}
                        to={`/projects/${related.meta.id}`}
                        className="block p-3 rounded-lg hover:bg-secondary/30 transition-colors group"
                      >
                        <p className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                          {related.meta.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {related.meta.category}
                        </p>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back Button (Mobile Sticky) */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
        <button
          onClick={() => navigate(-1)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-card border border-border rounded-xl shadow-lg hover:bg-secondary/30 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к проектам
        </button>
      </div>
    </div>
  );
};