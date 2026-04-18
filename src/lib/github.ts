import { GITHUB_CONFIG } from '../config/github';
import { generateFrontmatter, parseFrontmatter } from './frontmatter';

const { TOKEN, OWNER, REPO, USERS_FOLDER } = GITHUB_CONFIG;

const getHeaders = () => ({
  Authorization: `token ${TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
  'Content-Type': 'application/json'
});

const apiUrl = (path: string) =>
`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;

export const checkUserExists = async (username: string): Promise<boolean> => {
  const response = await fetch(apiUrl(`${USERS_FOLDER}/${username}.md`), {
    headers: getHeaders()
  });

  if (response.status === 200) return true;
  if (response.status === 404) return false;

  const body = await response.json().catch(() => ({}));
  throw new Error(`GitHub API error: ${body.message || response.status}`);
};

export const createUserProfile = async (username: string): Promise<void> => {
  const now = new Date().toISOString();

  const markdownContent = generateFrontmatter(
    {
      username,
      created: now,
      lastLogin: now,
      status: 'active'
    },
    `# Profile: ${username}\n\nДобро пожаловать в ваш новый профиль.`
  );

  const content = btoa(unescape(encodeURIComponent(markdownContent)));

  const response = await fetch(apiUrl(`${USERS_FOLDER}/${username}.md`), {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({
      message: `Create profile for ${username}`,
      content,
      branch: 'main'
    })
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 403 || body.message?.includes('not accessible')) {
      throw new Error(
        'Токен не имеет прав на запись. Обновите ваш PAT: установите Contents на «Чтение и запись».'
      );
    }
    throw new Error(
      `Не удалось создать профиль: ${body.message || response.status}`
    );
  }
};

export const getUserProfile = async (username: string): Promise<string> => {
  const response = await fetch(apiUrl(`${USERS_FOLDER}/${username}.md`), {
    headers: getHeaders()
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      `Не удалось получить профиль: ${body.message || response.status}`
    );
  }

  const data = await response.json();
  if (data.content) {
    return decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
  }

  throw new Error('Недопустимое содержимое файла');
};

export const updateUserProfileContent = async (
username: string,
newContent: string)
: Promise<void> => {
  // Fetch current file to get sha and existing frontmatter
  const response = await fetch(apiUrl(`${USERS_FOLDER}/${username}.md`), {
    headers: getHeaders()
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      `Не удалось получить профиль: ${body.message || response.status}`
    );
  }

  const data = await response.json();
  const sha = data.sha;
  const raw = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
  const { meta } = parseFrontmatter(raw);

  // Rebuild file with existing meta + new content
  const markdownContent = generateFrontmatter(meta, newContent);
  const encodedContent = btoa(unescape(encodeURIComponent(markdownContent)));

  const putResponse = await fetch(apiUrl(`${USERS_FOLDER}/${username}.md`), {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({
      message: `Update profile content for ${username}`,
      content: encodedContent,
      sha,
      branch: 'main'
    })
  });

  if (!putResponse.ok) {
    const body = await putResponse.json().catch(() => ({}));
    throw new Error(
      `Не удалось обновить профиль: ${body.message || putResponse.status}`
    );
  }
};