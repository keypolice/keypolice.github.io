import { GITHUB_CONFIG } from '../config/github';
import {
  generateFrontmatter,
  parseFrontmatter,
  FrontmatterData,
} from './frontmatter';

const { TOKEN, OWNER, REPO, PROJECTS_FOLDER = 'projects' } = GITHUB_CONFIG;

// ─────────────────────────────────────────────────────────────
// 🔷 GitHub API утилиты
// ─────────────────────────────────────────────────────────────

const getHeaders = () => ({
  Authorization: `token ${TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
});

const apiUrl = (path: string) =>
  `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;

// ─────────────────────────────────────────────────────────────
// 🔷 Типы данных (совместимы с projectStore.ts)
// ─────────────────────────────────────────────────────────────

export interface ProjectFrontmatter extends FrontmatterData {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'completed' | 'in-progress' | 'pending' | 'archived';
  author?: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string | string[];
  githubUrl?: string;
  liveUrl?: string;
  budget?: string;
  deadline?: string;
  priority?: 'low' | 'medium' | 'high';
  images?: string | string[];
  thumbnail?: string;
  collaborators?: string | string[];
  techStack?: string | string[];
}

export interface Project {
  meta: ProjectFrontmatter;
  content: string; // Markdown content
  sha?: string;
  path?: string;
}

// ─────────────────────────────────────────────────────────────
// 🔷 Парсинг и нормализация данных
// ─────────────────────────────────────────────────────────────

const parseArrayField = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter(Boolean) as string[];
  if (typeof value === 'string') {
    if (value.startsWith('[')) {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch {
        return value.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

const parseProjectMeta = (
  meta: FrontmatterData,
  id: string,
  fileName: string
): ProjectFrontmatter => {
  const tags = parseArrayField(meta.tags);
  const images = parseArrayField(meta.images);
  const collaborators = parseArrayField(meta.collaborators);
  const techStack = parseArrayField(meta.techStack);

  return {
    id,
    title: meta.title || fileName,
    description: meta.description || '',
    category: meta.category || 'general',
    status: (meta.status as ProjectFrontmatter['status']) || 'pending',
    author: meta.author,
    authorAvatar: meta.authorAvatar,
    createdAt: meta.createdAt || new Date().toISOString(),
    updatedAt: meta.updatedAt || meta.createdAt || new Date().toISOString(),
    tags,
    githubUrl: meta.githubUrl,
    liveUrl: meta.liveUrl,
    budget: meta.budget,
    deadline: meta.deadline,
    priority: (meta.priority as ProjectFrontmatter['priority']) || 'medium',
    images,
    thumbnail: meta.thumbnail || images?.[0],
    collaborators,
    techStack,
    // Сохраняем остальные поля из frontmatter
    ...meta,
  } as ProjectFrontmatter;
};

const prepareMetaForSave = (meta: ProjectFrontmatter): Record<string, unknown> => {
  const { id, ...metaToSave } = meta;
  
  // Конвертируем массивы в строки для YAML frontmatter
  return {
    ...metaToSave,
    tags: meta.tags?.length ? meta.tags : undefined,
    images: meta.images?.length ? meta.images : undefined,
    collaborators: meta.collaborators?.length ? meta.collaborators : undefined,
    techStack: meta.techStack?.length ? meta.techStack : undefined,
  };
};

// ─────────────────────────────────────────────────────────────
// 🔷 CRUD операции
// ─────────────────────────────────────────────────────────────

/**
 * Загрузка всех проектов из репозитория
 */
export const fetchAllProjects = async (): Promise<Project[]> => {
  const response = await fetch(apiUrl(PROJECTS_FOLDER), {
    headers: getHeaders(),
  });

  if (response.status === 404) return [];
  if (!response.ok) throw new Error(`Failed to fetch projects: ${response.status}`);

  const files = await response.json();
  if (!Array.isArray(files)) return [];

  const projects = await Promise.all(
    files
      .filter((f: any) => f.name.endsWith('.md') && f.type === 'file')
      .map(async (f: any) => {
        const fileRes = await fetch(apiUrl(`${PROJECTS_FOLDER}/${f.name}`), {
          headers: getHeaders(),
        });
        const fileData = await fileRes.json();
        
        // Декодируем base64 контент GitHub API
        const raw = decodeURIComponent(
          escape(atob(fileData.content.replace(/\s/g, '')))
        );
        
        const { meta, content } = parseFrontmatter(raw);
        const id = f.name.replace('.md', '');
        
        return {
          meta: parseProjectMeta(meta, id, f.name),
          content,
          sha: fileData.sha,
          path: f.path,
        };
      })
  );

  // Сортировка: сначала новые, затем по приоритету
  return projects.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff =
      (priorityOrder[a.meta.priority || 'low'] ?? 3) -
      (priorityOrder[b.meta.priority || 'low'] ?? 3);
    
    if (priorityDiff !== 0) return priorityDiff;
    
    return (
      new Date(b.meta.createdAt).getTime() -
      new Date(a.meta.createdAt).getTime()
    );
  });
};

/**
 * Загрузка одного проекта по ID
 */
export const fetchProject = async (projectId: string): Promise<Project | null> => {
  const response = await fetch(apiUrl(`${PROJECTS_FOLDER}/${projectId}.md`), {
    headers: getHeaders(),
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to fetch project: ${response.status}`);

  const data = await response.json();
  const raw = decodeURIComponent(
    escape(atob(data.content.replace(/\s/g, '')))
  );
  
  const { meta, content } = parseFrontmatter(raw);

  return {
    meta: parseProjectMeta(meta, projectId, `${projectId}.md`),
    content,
    sha: data.sha,
    path: data.path,
  };
};

/**
 * Создание нового проекта
 */
export const createProject = async (
  projectData: Omit<ProjectFrontmatter, 'id' | 'createdAt' | 'updatedAt'>,
  content: string
): Promise<Project> => {
  const now = new Date().toISOString();
  const id = `${projectData.title
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')}-${Date.now().toString(36)}`;

  const fullMeta: ProjectFrontmatter = {
    ...projectData,
    id,
    createdAt: now,
    updatedAt: now,
  } as ProjectFrontmatter;

  const markdownContent = generateFrontmatter(
    prepareMetaForSave(fullMeta),
    content
  );
  
  const encodedContent = btoa(unescape(encodeURIComponent(markdownContent)));

  const response = await fetch(apiUrl(`${PROJECTS_FOLDER}/${id}.md`), {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({
      message: `✨ Create project: ${projectData.title}`,
      content: encodedContent,
      branch: GITHUB_CONFIG.BRANCH || 'main',
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`Failed to create project: ${body.message || response.status}`);
  }

  const result = await response.json();
  
  return {
    meta: fullMeta,
    content,
    sha: result.content?.sha,
    path: result.content?.path,
  };
};

/**
 * Внутренняя функция для сохранения изменений проекта
 */
const saveProject = async (
  projectId: string,
  project: Project,
  updates: Partial<ProjectFrontmatter>,
  commitMessage: string
): Promise<string> => {
  const updatedMeta = { ...project.meta, ...updates, updatedAt: new Date().toISOString() };
  
  const markdownContent = generateFrontmatter(
    prepareMetaForSave(updatedMeta),
    project.content
  );
  
  const encodedContent = btoa(unescape(encodeURIComponent(markdownContent)));

  const response = await fetch(apiUrl(`${PROJECTS_FOLDER}/${projectId}.md`), {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({
      message: commitMessage,
      content: encodedContent,
      sha: project.sha,
      branch: GITHUB_CONFIG.BRANCH || 'main',
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Failed to save project: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.sha || '';
};

/**
 * Обновление метаданных проекта
 */
export const updateProject = async (
  projectId: string,
  updates: Partial<ProjectFrontmatter>
): Promise<Project> => {
  const project = await fetchProject(projectId);
  if (!project) throw new Error('Project not found');

  const newSha = await saveProject(
    projectId,
    project,
    updates,
    `📝 Update project: ${updates.title || projectId}`
  );

  return {
    ...project,
    meta: { ...project.meta, ...updates, updatedAt: new Date().toISOString() },
    sha: newSha,
  };
};

/**
 * Обновление только контента проекта
 */
export const updateProjectContent = async (
  projectId: string,
  newContent: string
): Promise<Project> => {
  const project = await fetchProject(projectId);
  if (!project) throw new Error('Project not found');

  const markdownContent = generateFrontmatter(
    prepareMetaForSave(project.meta),
    newContent
  );
  
  const encodedContent = btoa(unescape(encodeURIComponent(markdownContent)));

  const response = await fetch(apiUrl(`${PROJECTS_FOLDER}/${projectId}.md`), {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({
      message: `✏️ Update content: ${project.meta.title}`,
      content: encodedContent,
      sha: project.sha,
      branch: GITHUB_CONFIG.BRANCH || 'main',
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Failed to update content: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    ...project,
    content: newContent,
    sha: data.content?.sha,
  };
};

/**
 * Обновление статуса проекта
 */
export const updateProjectStatus = async (
  projectId: string,
  status: ProjectFrontmatter['status']
): Promise<Project> => {
  return updateProject(projectId, { status });
};

/**
 * Добавление тега к проекту
 */
export const addProjectTag = async (
  projectId: string,
  tag: string
): Promise<Project> => {
  const project = await fetchProject(projectId);
  if (!project) throw new Error('Project not found');
  
  const currentTags = project.meta.tags || [];
  if (currentTags.includes(tag)) return project;
  
  return updateProject(projectId, {
    tags: [...currentTags, tag],
  });
};

/**
 * Удаление тега из проекта
 */
export const removeProjectTag = async (
  projectId: string,
  tag: string
): Promise<Project> => {
  const project = await fetchProject(projectId);
  if (!project) throw new Error('Project not found');
  
  const newTags = (project.meta.tags || []).filter((t) => t !== tag);
  
  return updateProject(projectId, { tags: newTags });
};

/**
 * Добавление коллаборатора
 */
export const addCollaborator = async (
  projectId: string,
  username: string
): Promise<Project> => {
  const project = await fetchProject(projectId);
  if (!project) throw new Error('Project not found');
  
  const current = project.meta.collaborators || [];
  if (current.includes(username)) return project;
  
  // Auto-update status when first collaborator is added
  const newStatus = 
    project.meta.status === 'pending' && current.length === 0 
      ? 'in-progress' 
      : project.meta.status;
  
  return updateProject(projectId, {
    collaborators: [...current, username],
    status: newStatus,
  });
};

/**
 * Удаление коллаборатора
 */
export const removeCollaborator = async (
  projectId: string,
  username: string
): Promise<Project> => {
  const project = await fetchProject(projectId);
  if (!project) throw new Error('Project not found');
  
  const newCollaborators = (project.meta.collaborators || []).filter(
    (u) => u !== username
  );
  
  // Revert status if no collaborators left
  const newStatus =
    newCollaborators.length === 0 && project.meta.status === 'in-progress'
      ? 'pending'
      : project.meta.status;
  
  return updateProject(projectId, {
    collaborators: newCollaborators,
    status: newStatus,
  });
};

/**
 * Удаление проекта
 */
export const deleteProject = async (
  projectId: string,
  sha: string
): Promise<void> => {
  const response = await fetch(apiUrl(`${PROJECTS_FOLDER}/${projectId}.md`), {
    method: 'DELETE',
    headers: getHeaders(),
    body: JSON.stringify({
      message: `🗑️ Delete project: ${projectId}`,
      sha,
      branch: GITHUB_CONFIG.BRANCH || 'main',
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`Failed to delete project: ${body.message || response.status}`);
  }
};

// ─────────────────────────────────────────────────────────────
// 🔷 Вспомогательные функции для фильтрации на клиенте
// ─────────────────────────────────────────────────────────────

/**
 * Получение уникальных категорий из списка проектов
 */
export const getUniqueCategories = (projects: Project[]): string[] => {
  return [...new Set(projects.map((p) => p.meta.category))].sort();
};

/**
 * Получение уникальных тегов из списка проектов
 */
export const getUniqueTags = (projects: Project[]): string[] => {
  const tags = projects.flatMap((p) => p.meta.tags || []);
  return [...new Set(tags)].sort();
};

/**
 * Получение уникальных авторов
 */
export const getUniqueAuthors = (projects: Project[]): string[] => {
  return [...new Set(projects.map((p) => p.meta.author).filter(Boolean))] as string[];
};

/**
 * Фильтрация проектов по параметрам (клиентская)
 */
export const filterProjects = (
  projects: Project[],
  filters: {
    search?: string;
    categories?: string[];
    status?: string[];
    tags?: string[];
    author?: string;
    sortBy?: 'newest' | 'oldest' | 'title' | 'priority';
  }
): Project[] => {
  let result = [...projects];

  // 🔍 Поиск
  if (filters.search?.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.meta.title.toLowerCase().includes(q) ||
        p.meta.description.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.meta.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  // 📁 Категории
  if (filters.categories?.length) {
    result = result.filter((p) => filters.categories!.includes(p.meta.category));
  }

  // 📊 Статусы
  if (filters.status?.length) {
    result = result.filter((p) => filters.status!.includes(p.meta.status));
  }

  // 🏷️ Теги
  if (filters.tags?.length) {
    result = result.filter((p) =>
      p.meta.tags?.some((t) => filters.tags!.includes(t))
    );
  }

  // 👤 Автор
  if (filters.author) {
    result = result.filter((p) => p.meta.author === filters.author);
  }

  // 🔄 Сортировка
  switch (filters.sortBy) {
    case 'oldest':
      result.sort(
        (a, b) =>
          new Date(a.meta.createdAt).getTime() -
          new Date(b.meta.createdAt).getTime()
      );
      break;
    case 'title':
      result.sort((a, b) =>
        a.meta.title.localeCompare(b.meta.title, 'ru')
      );
      break;
    case 'priority':
      const order = { high: 0, medium: 1, low: 2 };
      result.sort(
        (a, b) =>
          (order[a.meta.priority || 'low'] ?? 3) -
          (order[b.meta.priority || 'low'] ?? 3)
      );
      break;
    case 'newest':
    default:
      result.sort(
        (a, b) =>
          new Date(b.meta.createdAt).getTime() -
          new Date(a.meta.createdAt).getTime()
      );
  }

  return result;
};

// ─────────────────────────────────────────────────────────────
// 🔷 Экспорт для удобства
// ─────────────────────────────────────────────────────────────

export const ProjectsAPI = {
  fetchAll: fetchAllProjects,
  fetchOne: fetchProject,
  create: createProject,
  update: updateProject,
  updateContent: updateProjectContent,
  updateStatus: updateProjectStatus,
  delete: deleteProject,
  addTag: addProjectTag,
  removeTag: removeProjectTag,
  addCollaborator,
  removeCollaborator,
  utils: {
    getUniqueCategories,
    getUniqueTags,
    getUniqueAuthors,
    filter: filterProjects,
  },
};

export default ProjectsAPI;