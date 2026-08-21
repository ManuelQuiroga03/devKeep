import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layout/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { CheatsheetsPage } from './pages/CheatsheetsPage';
import { FavoritesPage } from './pages/FavoritesPage';

export const App: React.FC = () => {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/cheatsheets" element={<CheatsheetsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;
