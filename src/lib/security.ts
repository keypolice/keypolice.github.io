export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  // Strip HTML tags
  const noHtml = input.replace(/<[^>]*>?/gm, '');
  // Trim whitespace
  return noHtml.trim();
};

export const validateUsername = (
username: string)
: {valid: boolean;error?: string;} => {
  if (!username)
  return { valid: false, error: 'Имя пользователя не может быть пустым.' };
  if (username.length < 3)
  return {
    valid: false,
    error: 'Имя пользователя должно содержать не менее 3 символов.'
  };
  if (username.length > 20)
  return {
    valid: false,
    error: 'Имя пользователя должно содержать не более 20 символов.'
  };
  if (!/^[a-zA-Z]+$/.test(username)) {
    return {
      valid: false,
      error:
      'Имя пользователя может содержать только латинские буквы (без пробелов, цифр и символов).'
    };
  }
  return { valid: true };
};