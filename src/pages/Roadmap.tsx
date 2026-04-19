import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import {
  CalendarDays,
  Rocket,
  Users,
  Target,
  CheckCircle2,
  Shield,
  Zap,
  Globe,
  Briefcase,
  Clock,
  TrendingUp,
  GitBranch,
  Eye,
  MessageSquare,
  DollarSign,
  Github,
  ArrowRight,
  Sparkles,
  RussianRuble
} from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const timelineEvents = [
  {
    period: 'Сейчас (MVP)',
    title: 'Старт платформы',
    description: 'Базовая авторизация для администратора, простая форма создания задачи, возможность просмотра задач и откликов.',
    icon: Rocket,
    color: 'bg-primary/20 text-primary',
    status: 'completed'
  },
  {
    period: 'Q2 2026',
    title: 'Рост сообщества',
    description: 'Регистрация фрилансеров и заказчиков, система рейтингов, личный кабинет с историей задач, базовая модерация.',
    icon: Users,
    color: 'bg-blue-500/20 text-blue-500',
    status: 'in-progress'
  },
  {
    period: 'Q3 2026',
    title: 'Умные алгоритмы',
    description: 'Автоматическое сопоставление задач с фрилансерами на основе навыков, система уведомлений, публичный API для интеграций.',
    icon: GitBranch,
    color: 'bg-purple-500/20 text-purple-500',
    status: 'planned'
  },
  {
    period: 'Q4 2026 / Через год',
    title: 'Децентрализованная экосистема',
    description: 'SaaS-версия для агентств, полное управление задачами без комиссии, верификация через GitHub, крупные проекты от компаний.',
    icon: Globe,
    color: 'bg-emerald-500/20 text-emerald-500',
    status: 'planned'
  }
];

const yearTargets = [
  {
    metric: '500+ задач',
    description: 'Распределено задач, средний дедлайн — 2 дня',
    icon: Briefcase,
    color: 'bg-orange-500/10 text-orange-500'
  },
  {
    metric: '90% выполнений',
    description: 'Заказов выполнено фрилансерами из пула, снижение спама в чатах на 95%',
    icon: CheckCircle2,
    color: 'bg-green-500/10 text-green-500'
  },
  {
    metric: '0% комиссии',
    description: 'Бесплатная платформа. SaaS для агентств. Децентрализованная разработка для разработчиков',
    icon: RussianRuble,
    color: 'bg-yellow-500/10 text-yellow-500'
  },
  {
    metric: '300+ фрилансеров',
    description: 'Активное сообщество разработчиков, дизайнеров и менеджеров',
    icon: Users,
    color: 'bg-blue-500/10 text-blue-500'
  }
];

const todayFeatures = [
  {
    title: 'Авторизация администратора',
    description: 'Безопасный вход для администрирования платформы.',
    icon: Shield
  },
  {
    title: 'Форма создания задачи',
    description: 'Любой пользователь может указать навыки, бюджет и дедлайн. Просто и быстро.',
    icon: Sparkles
  },
  {
    title: 'Просмотр списка задач',
    description: 'Все активные проекты в удобной карточной ленте.',
    icon: Eye
  },
  {
    title: 'Базовая система откликов',
    description: 'Фрилансеры могут откликаться на задачи, заказчики — просматривать кандидатов.',
    icon: MessageSquare
  }
];

export const Roadmap = () => {
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
              <CalendarDays className="w-4 h-4 mr-2" />
              Наше видение 2026
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight">
              Дорожная карта{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                развития
              </span>
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Прозрачный план превращения KPOL в ведущую децентрализованную биржу задач для IT-сообщества.
              От первых шагов до глобальной экосистемы.
            </motion.p>

            <motion.div variants={fadeIn}>
              <Link
                to="/tasks"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 group">
                Посмотреть задачи
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Ожидаемые результаты через год */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Цели через год
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                К четвёртому кварталу 2026 года мы планируем достичь следующих показателей
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {yearTargets.map((target, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all hover:border-primary/30">
                  <div className={`w-14 h-14 rounded-2xl ${target.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <target.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{target.metric}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{target.description}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20 text-center">
              <p className="text-foreground/80 flex items-center justify-center gap-2 flex-wrap">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-semibold">Децентрализованная модель:</span>
                платформа разработана разработчиками для разработчиков, без посредников и скрытых комиссий.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Что уже сегодня? */}
        <section className="py-24 px-4 bg-muted/30 border-t border-border/40">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Что уже сегодня?
              </h2>
              <p className="text-muted-foreground text-lg">
                Базовый функционал доступен прямо сейчас
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {todayFeatures.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/create-task"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-md group">
                <Sparkles className="w-4 h-4 mr-2" />
                Создать задачу сейчас
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-xs text-muted-foreground mt-4">
                Любой желающий может оставить задачу — укажите навыки, бюджет и дедлайн
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>);

};