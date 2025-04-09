import React from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import "./App.css";
import "./components/css_utils/variables.css";
import Header from "./components/header/header";
import HomePage from "./components/homepage/homepage";
import BudBarPage from "./components/budbarpage/budbar";
import MembershipCardHolder from "./components/membershipcardpage/membership";
import TalkToUs from "./components/talk_to_uspage/talktous";
import Error404 from "./components/error_404page/error404";
import AuthPage from "./components/auth/auth"; // Import the Auth component

export default function App() {
  return (
    <div>
      <AuthProvider>
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/theBudBarPage" 
              element={
                <ProtectedRoute>
                  <BudBarPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/membershipCardHolder" 
              element={
                <ProtectedRoute>
                  <MembershipCardHolder />
                </ProtectedRoute>
              } 
            />
            <Route path="/talkToUsPage" element={<TalkToUs />} />
            <Route path="/404" element={<Error404 />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>
      </AuthProvider>
    </div>
  );
}
