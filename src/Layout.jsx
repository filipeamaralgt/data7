
import React, { useState, useEffect } from "react";
import { UserSettings } from "@/entities/UserSettings";
import { User } from "@/entities/User";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import AIInsights from "./components/dashboard/AIInsights";
import { AppProvider, useAppContext } from "@/components/context/AppContext";
import LoadingSpinner from "./components/layout/LoadingSpinner";
import { Toaster } from "@/components/ui/toaster";

function LayoutContent({ children }) {
  const [user, setUser] = useState(null); // New state for user
  const [userSettings, setUserSettings] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { theme, setTheme, syncFromUrl } = useAppContext();

  // 1. Effect for initializing the app and loading user data ONCE on mount
  useEffect(() => {
    setIsLoading(true); // Ensure loading state is true when the effect starts

    const initializeApp = async () => {
      // Logic is separated to be run in parallel with a timer
      try {
        const currentUser = await User.me(); // Fetch current user
        // If User.me() succeeds, we have a valid session.
        if (!currentUser) {
            // This case is unlikely as User.me() throws on failure, but as a safeguard:
            throw new Error("Usuário não autenticado.");
        }
        setUser(currentUser); // Set user state

        syncFromUrl(); // Sync URL params first
        
        const settingsList = await UserSettings.filter({ created_by: currentUser.email }); // Use currentUser.email

        let currentSettings;
        if (settingsList.length > 0) {
          currentSettings = settingsList[0];
        } else {
          // If no settings exist, create them
          currentSettings = await UserSettings.create({
            theme: "light",
            sidebar_collapsed: false,
            language: "pt-BR"
          });
        }
        
        setUserSettings(currentSettings);
        setCollapsed(currentSettings.sidebar_collapsed || false);
        
        // Set theme from database without triggering a re-save
        if (currentSettings.theme && currentSettings.theme !== theme) {
          setTheme(currentSettings.theme); 
        }
      } catch (error) {
        console.error("Erro na inicialização do app:", error);
        
        // If any part of initialization fails (especially User.me()),
        // assume an invalid session and redirect to login.
        // This is a robust way to handle expired tokens or network issues during auth checks.
        User.login();
        // Return a rejected promise to stop the loading process
        return Promise.reject(error);
      }
    };
    
    // Promise for minimum display time (1 second)
    const minimumDisplayPromise = new Promise(resolve => setTimeout(resolve, 1000));
    
    // Run app initialization and timer in parallel
    Promise.all([
      initializeApp(),
      minimumDisplayPromise
    ]).catch(() => {
      // Catching errors from initializeApp to prevent unhandled promise rejections,
      // but the main error handling (redirect) is inside initializeApp.
      // We don't need to do anything here, but the catch is important.
    }).finally(() => {
      setIsLoading(false); // Stop loading only after both are done
    });

     
  }, []); // Empty dependency array ensures this runs only once.

  // 2. Effect for persisting theme changes to the backend
  useEffect(() => {
    const persistTheme = async () => {
      // Only run if settings are loaded and theme is different from saved theme
      if (userSettings && theme !== userSettings.theme) {
        try {
          await UserSettings.update(userSettings.id, { theme });
          // Update local state to prevent re-triggering
          setUserSettings(prev => ({...prev, theme}));
        } catch (error) {
          console.error("Erro ao salvar tema", error);
        }
      }
    };
    persistTheme();
     
  }, [theme]); // This effect runs only when the global theme changes


  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  // Simplified update function
  const updateSettings = async (newSettings) => {
    if (!userSettings) return;

    // Optimistic UI update
    if (typeof newSettings.sidebar_collapsed === 'boolean') {
      setCollapsed(newSettings.sidebar_collapsed);
    }
    setUserSettings(prev => ({ ...prev, ...newSettings }));
    
    try {
      await UserSettings.update(userSettings.id, newSettings);
    } catch (error) {
      console.error("Erro ao salvar configurações", error);
      // Revert optimistic update on failure - could add this logic if needed
    }
  };

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const handleSidebarToggle = () => {
    const newCollapsed = !collapsed;
    updateSettings({ sidebar_collapsed: newCollapsed });
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === "dark" ? "bg-[#0F172A]" : "bg-[#F9FAFB]"
      }`}>
        <LoadingSpinner />
      </div>
    );
  }

  // Do not render the main layout if authentication failed and user/settings are not available.
  // The redirect in initializeApp should handle this, but this is a safeguard.
  if (!user || !userSettings) {
    return (
        <div className={`min-h-screen flex items-center justify-center ${
            theme === "dark" ? "bg-[#0F172A]" : "bg-[#F9FAFB]"
        }`}>
            <LoadingSpinner />
        </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-[#0F172A]" : "bg-[#F9FAFB]"}`}>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { 
          width: 0;
          height: 0;
        }
        .scrollbar-slim {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent; /* slate-300 */
        }
        .dark .scrollbar-slim {
          scrollbar-color: #334155 transparent; /* slate-700 */
        }
        .scrollbar-slim::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        .scrollbar-slim::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-slim::-webkit-scrollbar-thumb {
          background-color: #cbd5e1; /* slate-300 */
          border-radius: 8px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .dark .scrollbar-slim::-webkit-scrollbar-thumb {
          background-color: #334155; /* slate-700 */
        }
      `}</style>
      <Sidebar collapsed={collapsed} onToggle={handleSidebarToggle} />
      <Topbar onThemeToggle={handleThemeToggle} collapsed={collapsed} user={user} />
      
      <main
        className={`transition-all duration-300 ease-out ${
          collapsed ? "ml-[72px]" : "ml-64"
        } mt-16 p-6`}
      >
        {children}
      </main>

      <AIInsights />
      <Toaster position="top-right" />
    </div>
  );
}

export default function Layout({ children }) {
  return (
    <AppProvider>
      <LayoutContent>{children}</LayoutContent>
    </AppProvider>
  )
}
