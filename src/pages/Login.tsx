import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { checkUserExists, createUserProfile } from '../lib/github';
import { checkRateLimit, clearRateLimit } from '../lib/rateLimit';
import { sanitizeInput, validateUsername } from '../lib/security';
import { Loader2, Github } from 'lucide-react';
import { Navbar } from '../components/Navbar';
export const Login = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const sanitizedUsername = sanitizeInput(username);
    setUsername(sanitizedUsername);
    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      const seconds = Math.ceil(rateLimit.remainingMs / 1000);
      setError(
        `Слишком много попыток. Подождите ${seconds} секунд перед повторной попыткой.`
      );
      return;
    }
    const validation = validateUsername(sanitizedUsername);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }
    setIsLoading(true);
    try {
      const exists = await checkUserExists(sanitizedUsername);
      if (!exists) {
        await createUserProfile(sanitizedUsername);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const confirmed = await checkUserExists(sanitizedUsername);
        if (!confirmed) {
          setError(
            'Профиль был создан, но не удалось подтвердить. Попробуйте снова.'
          );
          return;
        }
      }
      clearRateLimit();
      login(sanitizedUsername);
      navigate('/profile');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Произошла ошибка при аутентификации.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md p-6 md:p-8 bg-card border border-border rounded-xl shadow-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Github className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-center">
              Вход / Регистрация
            </h2>
            <p className="text-sm text-muted-foreground text-center mt-2 max-w-[280px]">
              Введите имя пользователя для продолжения. Если у вас нет аккаунта,
              он будет создан автоматически.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                
                Имя пользователя
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="например: johndoe"
                disabled={isLoading}
                autoComplete="off" />
              
              <p className="text-[0.8rem] text-muted-foreground">
                Допускаются только латинские буквы (a-z, A-Z).
              </p>
            </div>

            {error &&
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                {error}
              </div>
            }

            <button
              type="submit"
              disabled={isLoading || !username}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
              
              {isLoading ?
              <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Авторизация...
                </> :

              'Продолжить'
              }
            </button>
          </form>
        </div>
      </div>
    </div>);

};