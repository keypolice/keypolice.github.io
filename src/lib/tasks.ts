import { GITHUB_CONFIG } from '../config/github';
import {
  generateFrontmatter,
  parseFrontmatter,
  FrontmatterData } from
'./frontmatter';

const { TOKEN, OWNER, REPO, TASKS_FOLDER } = GITHUB_CONFIG;

const getHeaders = () => ({
  Authorization: `token ${TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
  'Content-Type': 'application/json'
});

const apiUrl = (path: string) =>
`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;

export interface TaskMeta extends FrontmatterData {
  id: string;
  title: string;
  category: string;
  budget: string;
  status: 'open' | 'in-progress' | 'completed' | 'closed';
  externalUrl: string;
  createdBy: string;
  created: string;
  deadline: string;
  assignees: string[];
}

export interface Task {
  meta: TaskMeta;
  content: string;
  sha?: string;
}

const parseTaskMeta = (meta: FrontmatterData, id: string): TaskMeta => {
  const assigneesRaw = meta.assignees;
  let assignees: string[] = [];
  if (Array.isArray(assigneesRaw)) {
    assignees = assigneesRaw as string[];
  } else if (typeof assigneesRaw === 'string' && assigneesRaw.startsWith('[')) {
    try {
      assignees = JSON.parse(assigneesRaw);
    } catch {
      assignees = [];
    }
  }
  return { ...meta, id, assignees } as TaskMeta;
};

export const fetchAllTasks = async (): Promise<Task[]> => {
  const response = await fetch(apiUrl(TASKS_FOLDER), {
    headers: getHeaders()
  });

  if (response.status === 404) return [];
  if (!response.ok) throw new Error('Failed to fetch tasks list');

  const files = await response.json();
  if (!Array.isArray(files)) return [];

  const tasks = await Promise.all(
    files.
    filter((f: any) => f.name.endsWith('.md')).
    map(async (f: any) => {
      const fileRes = await fetch(apiUrl(`${TASKS_FOLDER}/${f.name}`), {
        headers: getHeaders()
      });
      const fileData = await fileRes.json();
      const raw = decodeURIComponent(
        escape(atob(fileData.content.replace(/\n/g, '')))
      );
      const { meta, content } = parseFrontmatter(raw);
      return {
        meta: parseTaskMeta(meta, f.name.replace('.md', '')),
        content,
        sha: fileData.sha
      };
    })
  );

  return tasks.sort(
    (a, b) =>
    new Date(b.meta.created).getTime() - new Date(a.meta.created).getTime()
  );
};

export const fetchTask = async (taskId: string): Promise<Task | null> => {
  const response = await fetch(apiUrl(`${TASKS_FOLDER}/${taskId}.md`), {
    headers: getHeaders()
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Failed to fetch task');

  const data = await response.json();
  const raw = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
  const { meta, content } = parseFrontmatter(raw);

  return {
    meta: parseTaskMeta(meta, taskId),
    content,
    sha: data.sha
  };
};

export const createTask = async (
taskMeta: Omit<TaskMeta, 'id' | 'created' | 'assignees'>,
content: string)
: Promise<void> => {
  const now = new Date().toISOString();
  const id = `${taskMeta.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

  const fullMeta = {
    ...taskMeta,
    created: now,
    assignees: [] as string[]
  };

  const markdownContent = generateFrontmatter(fullMeta as any, content);
  const encodedContent = btoa(unescape(encodeURIComponent(markdownContent)));

  const response = await fetch(apiUrl(`${TASKS_FOLDER}/${id}.md`), {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({
      message: `Create task: ${taskMeta.title}`,
      content: encodedContent,
      branch: 'main'
    })
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`Failed to create task: ${body.message || response.status}`);
  }
};

const saveTaskMeta = async (
taskId: string,
task: Task,
updatedMeta: Partial<TaskMeta>,
commitMsg: string)
: Promise<string> => {
  const newMeta = { ...task.meta, ...updatedMeta };
  const { id, ...metaToSave } = newMeta;

  const markdownContent = generateFrontmatter(metaToSave as any, task.content);
  const encodedContent = btoa(unescape(encodeURIComponent(markdownContent)));

  const response = await fetch(apiUrl(`${TASKS_FOLDER}/${taskId}.md`), {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({
      message: commitMsg,
      content: encodedContent,
      sha: task.sha,
      branch: 'main'
    })
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Failed: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.sha || '';
};

export const updateTaskStatus = async (
taskId: string,
status: TaskMeta['status'])
: Promise<void> => {
  const task = await fetchTask(taskId);
  if (!task) throw new Error('Task not found');
  await saveTaskMeta(
    taskId,
    task,
    { status },
    `Update task status: ${taskId} to ${status}`
  );
};

export const assignTask = async (
taskId: string,
username: string)
: Promise<Task> => {
  const task = await fetchTask(taskId);
  if (!task) throw new Error('Task not found');

  const currentAssignees = task.meta.assignees || [];
  if (currentAssignees.includes(username)) {
    return task; // Already assigned
  }

  const newAssignees = [...currentAssignees, username];
  // Auto-set status to in-progress when first person takes the task
  const newStatus =
  task.meta.status === 'open' ? 'in-progress' : task.meta.status;

  const newSha = await saveTaskMeta(
    taskId,
    task,
    { assignees: newAssignees, status: newStatus },
    `Assign ${username} to task: ${taskId}`
  );

  return {
    ...task,
    meta: { ...task.meta, assignees: newAssignees, status: newStatus },
    sha: newSha || task.sha
  };
};

export const unassignTask = async (
taskId: string,
username: string)
: Promise<Task> => {
  const task = await fetchTask(taskId);
  if (!task) throw new Error('Task not found');

  const currentAssignees = task.meta.assignees || [];
  const newAssignees = currentAssignees.filter((u) => u !== username);
  // If no one is assigned anymore, revert to open
  const newStatus =
  newAssignees.length === 0 && task.meta.status === 'in-progress' ?
  'open' :
  task.meta.status;

  const newSha = await saveTaskMeta(
    taskId,
    task,
    { assignees: newAssignees, status: newStatus },
    `Unassign ${username} from task: ${taskId}`
  );

  return {
    ...task,
    meta: { ...task.meta, assignees: newAssignees, status: newStatus },
    sha: newSha || task.sha
  };
};

export const deleteTask = async (
taskId: string,
sha: string)
: Promise<void> => {
  const response = await fetch(apiUrl(`${TASKS_FOLDER}/${taskId}.md`), {
    method: 'DELETE',
    headers: getHeaders(),
    body: JSON.stringify({
      message: `Delete task: ${taskId}`,
      sha,
      branch: 'main'
    })
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`Failed to delete task: ${body.message || response.status}`);
  }
};