import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate } from
'react-router-dom';
import { AuthProvider } from './store/authStore';
import { TaskProvider } from './store/taskStore';
import { ProjectProvider } from './store/projectStore';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Tasks } from './pages/Tasks';
import { Roadmap } from './pages/Roadmap';
import { TaskDetail } from './pages/TaskDetail';
import { AdminPanel } from './pages/AdminPanel';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { ProjectForm } from './pages/ProjectForm';
export function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <ProjectProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/projects/new" element={<ProjectForm />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        </ProjectProvider>
      </TaskProvider>
    </AuthProvider>);

}