export interface FrontmatterData {
  username?: string;
  created?: string;
  lastLogin?: string;
  status?: string;
  [key: string]: string | string[] | undefined;
}

export const parseFrontmatter = (
raw: string)
: {meta: FrontmatterData;content: string;} => {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!match) {
    return { meta: {}, content: raw };
  }

  const metaBlock = match[1];
  const content = match[2].trim();

  const meta: FrontmatterData = {};

  metaBlock.split('\n').forEach((line) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      // Try to parse JSON arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            meta[key] = parsed;
            return;
          }
        } catch {

          // Not valid JSON, treat as string
        }}
      meta[key] = value;
    }
  });

  return { meta, content };
};

export const generateFrontmatter = (
meta: FrontmatterData,
content: string)
: string => {
  let result = '---\n';
  for (const [key, value] of Object.entries(meta)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        result += `${key}: ${JSON.stringify(value)}\n`;
      } else {
        result += `${key}: ${value}\n`;
      }
    }
  }
  result += '---\n\n' + content;
  return result;
};