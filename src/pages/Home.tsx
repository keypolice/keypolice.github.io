import React, { Children } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import {
  CheckCircle2,
  Shield,
  Zap,
  HeadphonesIcon,
  ArrowRight,
  Github,
  Briefcase,
  Users,
  Star } from
'lucide-react';
const fadeIn = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0
  },
  transition: {
    duration: 0.5
  }
};
const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
  // Шаблон задач по уровням сложности (номера 1-6)
  const taskTemplates = [
    // Уровень 1 - Легкие задачи
    {
      title: 'Базовая задача',
      description: 'Выполните простое действие: добавьте 1 элемент в список.',
      level: 1,
      icon: Dice1,
      color: 'bg-green-500',
      points: '10'
    },
    // Уровень 2
    {
      title: 'Простая задача',
      description: 'Создайте функцию, которая возвращает сумму двух чисел.',
      level: 2,
      icon: Dice2,
      color: 'bg-blue-500',
      points: '25'
    },
    // Уровень 3
    {
      title: 'Средняя задача',
      description: 'Напишите компонент с условным рендерингом на основе состояния.',
      level: 3,
      icon: Dice3,
      color: 'bg-yellow-500',
      points: '50'
    },
    // Уровень 4
    {
      title: 'Сложная задача',
      description: 'Реализуйте drag-and-drop функциональность для списка элементов.',
      level: 4,
      icon: Dice4,
      color: 'bg-orange-500',
      points: '100'
    },
    // Уровень 5
    {
      title: 'Экспертная задача',
      description: 'Создайте кастомный хук для управления состоянием формы с валидацией.',
      level: 5,
      icon: Dice5,
      color: 'bg-purple-500',
      points: '200'
    },
    // Уровень 6 - Максимальная сложность
    {
      title: 'Эпическая задача',
      description: 'Разработайте полную систему аутентификации с JWT и protected routes.',
      level: 6,
      icon: Dice6,
      color: 'bg-red-500',
      points: '500'
    }
  ];

  const generateRandomTask = () => {
    const randomIndex = Math.floor(Math.random() * taskTemplates.length);
    return taskTemplates[randomIndex];
  };

  const currentTask = generateRandomTask();
export const Home = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>

          <motion.div
            className="container mx-auto max-w-4xl text-center relative z-10"
            initial="initial"
            animate="animate"
            variants={stagger}>
            
            <motion.div
              variants={fadeIn}
              className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8">
              
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              Платформа нового поколения
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight">
              
              Фриланс биржа на базе{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                открытого кода
              </span>
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              
              Инновационная система  управления задачами.
              Находите исполнителей, берите проекты в работу и управляйте
              процессом.
            </motion.p>

            <motion.div
              variants={fadeIn}
              className="flex flex-col sm:flex-row items-center justify-center gap-4">
              
              <Link
                to="/tasks"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 w-full sm:w-auto group">
                
                Найти проект
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              {user ?
              <Link
                to="/profile"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-foreground bg-secondary rounded-xl hover:bg-secondary/80 transition-colors w-full sm:w-auto">
                
                  Перейти в профиль
                </Link> :

              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-foreground bg-secondary rounded-xl hover:bg-secondary/80 transition-colors w-full sm:w-auto">
                
                  Стать исполнителем
                </Link>
              }
            </motion.div>
          </motion.div>
        </section>

        <section className="py-12 border-y border-border/40 bg-gradient-to-br from-muted/50 to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Генератор случайных задач
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Бросьте кубик и получите задачу соответствующего уровня сложности
          </p>
        </div>

        {/* Кнопка генерации */}
        <div className="flex justify-center mb-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            onClick={() => window.location.reload()} // Перезагрузка для новой задачи
          >
            🎲 Бросить кубик
          </motion.button>
        </div>

        {/* Статистика уровней */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 text-center mb-16">
          {[
            { label: 'Новичок', value: '1', icon: Dice1, color: 'bg-green-500/10 text-green-500' },
            { label: 'Легко', value: '2', icon: Dice2, color: 'bg-blue-500/10 text-blue-500' },
            { label: 'Средне', value: '3', icon: Dice3, color: 'bg-yellow-500/10 text-yellow-500' },
            { label: 'Сложно', value: '4', icon: Dice4, color: 'bg-orange-500/10 text-orange-500' },
            { label: 'Эксперт', value: '5', icon: Dice5, color: 'bg-purple-500/10 text-purple-500' },
            { label: 'Мастер', value: '6', icon: Dice6, color: 'bg-red-500/10 text-red-500' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`flex flex-col items-center p-6 rounded-2xl ${stat.color} border border-border/50`}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-transparent rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <stat.icon className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Текущая сгенерированная задача */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto bg-gradient-to-br from-background to-muted p-12 rounded-3xl border border-border shadow-2xl"
        >
          <div className={`w-24 h-24 ${currentTask.color}/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl border-4 border-dashed ${currentTask.color}/30`}>
            <currentTask.icon className="w-16 h-16" />
          </div>
          
          <h3 className="text-3xl font-black text-center bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text mb-6">
            {currentTask.title}
          </h3>
          
          <div className="bg-muted/50 p-6 rounded-2xl mb-8">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {currentTask.description}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2 text-2xl font-bold">
              <span>Уровень:</span>
              <span className={`px-4 py-2 rounded-full ${currentTask.color}/20 text-lg font-black border-2 border-dashed ${currentTask.color}/30`}>
                {currentTask.level}
              </span>
            </div>
            <div className="text-2xl font-bold text-green-500">
              {currentTask.points} очков
            </div>
          </div>
        </motion.div>
      </div>
    </section>

        {/* Stats Section */}
        {/* <section className="py-12 border-y border-border/40 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
              {
                label: 'Активных проектов',
                value: '500+',
                icon: Briefcase
              },
              {
                label: 'Фрилансеров',
                value: '1000+',
                icon: Users
              },
              {
                label: 'Успешных сделок',
                value: '10k+',
                icon: CheckCircle2
              },
              {
                label: 'Довольных клиентов',
                value: '98%',
                icon: Star
              }].
              map((stat, i) =>
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  y: 20
                }}
                whileInView={{
                  opacity: 1,
                  y: 0
                }}
                viewport={{
                  once: true
                }}
                transition={{
                  delay: i * 0.1
                }}
                className="flex flex-col items-center">
                
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              )}
            </div>
          </div>
        </section> */}

        {/* Features Section */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Почему выбирают нас
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Платформа создана для максимального удобства как заказчиков, так
                и исполнителей.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
              {
                title: 'Быстрый поиск',
                description:
                'Умная система фильтрации и поиска поможет найти идеальный проект или исполнителя за считанные минуты.',
                icon: Zap
              },
              {
                title: 'Безопасность',
                description:
                'Все данные хранятся в защищенных репозиториях. Прозрачная история процесса сделки.',
                icon: Shield
              },
              {
                title: 'Поддержка 24/7',
                description:
                'Наша команда всегда на связи и готова помочь в решении любых вопросов.',
                icon: HeadphonesIcon
              }].
              map((feature, i) =>
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  y: 20
                }}
                whileInView={{
                  opacity: 1,
                  y: 0
                }}
                viewport={{
                  once: true
                }}
                transition={{
                  delay: i * 0.1
                }}
                className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
                
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 px-4 bg-muted/30 border-y border-border/40">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Как это работает
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Всего три простых шага до успешного результата
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0"></div>

              {[
              {
                step: '01',
                title: 'Разместите задачу',
                desc: 'Опишите требования, укажите бюджет и сроки выполнения.'
              },
              {
                step: '02',
                title: 'Выберите исполнителя',
                desc: 'Получайте отклики и выбирайте лучшего специалиста.'
              },
              {
                step: '03',
                title: 'Получите результат',
                desc: 'Принимайте работу.'
              }].
              map((item, i) =>
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  y: 20
                }}
                whileInView={{
                  opacity: 1,
                  y: 0
                }}
                viewport={{
                  once: true
                }}
                transition={{
                  delay: i * 0.1
                }}
                className="relative z-10 flex flex-col items-center text-center bg-background p-6 rounded-2xl border border-border shadow-sm">
                
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mb-6 shadow-md">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95
              }}
              whileInView={{
                opacity: 1,
                scale: 1
              }}
              viewport={{
                once: true
              }}
              className="bg-primary rounded-3xl p-8 md:p-16 text-center text-primary-foreground relative overflow-hidden">
              
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  Готовы начать?
                </h2>
                <p className="text-primary-foreground/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                  Присоединяйтесь к фрилансерам и заказчикам, которые
                  уже используют нашу платформу.
                </p>
                <Link
                  to={user ? '/tasks' : '/login'}
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-primary bg-background rounded-xl hover:bg-background/90 transition-colors shadow-lg">
                  
                  {user ? 'Перейти к проектам' : 'Зарегистрироваться бесплатно'}
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Github className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold">KPOL</span>
              </div>
              <p className="text-muted-foreground max-w-sm">
                Платформа для фрилансеров и заказчиков,
                построенная на базе открытого кода.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Платформа</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/tasks"
                    className="hover:text-primary transition-colors">
                    
                    Проекты
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="hover:text-primary transition-colors">
                    
                    Регистрация
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Как это работает
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">
                Правовая информация
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Условия использования
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Политика конфиденциальности
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Правила платформы
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>
              &copy; 2026 KPOL. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>);

};