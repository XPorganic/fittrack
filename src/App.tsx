import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { BottomNav, Sidebar } from "@/components/layout/Navigation";
import { useStore } from "@/store/useStore";
import Home from "@/pages/Home";
import Goals from "@/pages/Goals";
import Meals from "@/pages/Meals";
import Advice from "@/pages/Advice";
import Settings from "@/pages/Settings";
import Onboarding from "@/components/Onboarding";
import DataBackupBanner from "@/components/DataBackupBanner";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:ml-64 pb-36 lg:pb-20">
        <div className="max-w-4xl mx-auto p-4 lg:p-6">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  const { profile, setProfile, setInitialized } = useStore();

  const handleOnboardingComplete = (newProfile: typeof profile) => {
    if (newProfile) {
      setProfile(newProfile);
      setInitialized();
    }
  };

  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Router>
      <DataBackupBanner />
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/advice" element={<Advice />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}
