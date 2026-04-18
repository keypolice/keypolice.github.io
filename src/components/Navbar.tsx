import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { GITHUB_CONFIG } from '../config/github';
import {
  Github,
  Menu,
  X,
  User,
  Briefcase,
  Shield,
  Home,
  LogIn } from
'lucide-react';
export const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = user && GITHUB_CONFIG.ADMIN_USERS.includes(user);
  const navLinks = [
  {
    to: '/',
    label: 'Главная',
    icon: Home
  },
  {
    to: '/tasks',
    label: 'Проекты',
    icon: Briefcase
  },
  ...(isAdmin ?
  [
  {
    to: '/admin',
    label: 'Админ',
    icon: Shield
  }] :

  [])];

  const isActive = (path: string) => location.pathname === path;
  return (
    <header className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0"
          onClick={() => setMobileOpen(false)}>
          
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Github className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">KPOL</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) =>
          <Link
            key={link.to}
            to={link.to}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive(link.to) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
            
              {link.label}
            </Link>
          )}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ?
          <Link
            to="/profile"
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive('/profile') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
            
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              @{user}
            </Link> :

          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            
              <LogIn className="w-4 h-4" />
              Войти
            </Link>
          }
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}>
          
          {mobileOpen ?
          <X className="w-5 h-5" /> :

          <Menu className="w-5 h-5" />
          }
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen &&
      <div className="md:hidden border-t border-border bg-card animate-in slide-in-from-top-2 duration-200">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) =>
          <Link
            key={link.to}
            to={link.to}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive(link.to) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
            
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
          )}

            <div className="my-2 border-t border-border" />

            {user ?
          <Link
            to="/profile"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive('/profile') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
            
                <User className="w-4 h-4" />
                Профиль (@{user})
              </Link> :

          <Link
            to="/login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            
                <LogIn className="w-4 h-4" />
                Войти / Регистрация
              </Link>
          }
          </nav>
        </div>
      }
    </header>);

};