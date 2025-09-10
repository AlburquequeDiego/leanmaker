import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CompanyChallenges } from '../components/challenges/CompanyChallenges';
import { ChallengeDetail } from '../components/challenges/ChallengeDetail';
import { ChallengeList } from '../components/challenges/ChallengeList';

export const ChallengeRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rutas para empresas */}
      <Route path="/company/challenges" element={<CompanyChallenges />} />
      <Route path="/company/challenges/:id" element={<ChallengeDetail />} />
      <Route path="/company/challenges/:id/edit" element={<ChallengeDetail />} />
      
      {/* Rutas públicas */}
      <Route path="/challenges" element={<ChallengeList />} />
      <Route path="/challenges/:id" element={<ChallengeDetail />} />
    </Routes>
  );
};
