
import React, { useState, useEffect } from "react";
import "./App.css";
import "./components/css_utils/variables.css";
import Header from "./components/header/header";
import HomePage from "./components/homepage/homepage";
import BudBarPage from "./components/budbarpage/budbar";
import MembershipCardHolder from "./components/membershipcardpage/membership";
import TalkToUs from "./components/talk_to_uspage/talktous";
import Error404 from "./components/error_404page/error404";
import UserAuth from "./components/user_auth/userauth";
import ProtectedRoute from "./components/user_auth/ProtectedRoute";
import { AuthProvider } from "./context/AuthProvider";
import { NotificationProvider } from "./context/NotificationProvider";
import Toast from "./components/notifications/Toast";

export default function App() {
  const [currentPage, setCurrentPage] = useState("homePage");

  useEffect(() => {
    // Set initial page based on hash or default to home
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || "homePage";
      setCurrentPage(hash);
    };

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Set initial page

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Render the appropriate component based on current page
  const renderPage = () => {
    switch (currentPage) {
      case "homePage":
        return <HomePage />;
      case "theBudBarPage":
        // Protected - only accessible to authenticated users
        return (
          <ProtectedRoute>
            <BudBarPage />
          </ProtectedRoute>
        );
      case "membershipCardHolder":
        // Protected - only accessible to authenticated users
        return (
          <ProtectedRoute>
            <MembershipCardHolder />
          </ProtectedRoute>
        );
      case "talkToUsPage":
        return <TalkToUs />;
      case "userAuthenticationPage":
        return <UserAuth />;
      case "page404":
        return <Error404 />;
      default:
        return <HomePage />;
    }
  };

  return (
    <AuthProvider>
      <NotificationProvider>
      <div className="main-content-wrapper">
        <Header currentPage={currentPage} />
        <main className="main-content">
          {renderPage()}
        </main>
        <Toast />
      </div>
      </NotificationProvider>
    </AuthProvider>
  );
}
