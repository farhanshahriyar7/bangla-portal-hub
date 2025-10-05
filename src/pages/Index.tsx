import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Menu } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { WelcomeHeader } from "@/components/WelcomeHeader";
import { QuickStats } from "@/components/QuickStats";
import { DashboardCard } from "@/components/DashboardCard";
import { User, Building2, FileText, Calendar } from "lucide-react";

const Index = () => {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const { toast } = useToast();
  const { signOut } = useAuth();
  const navigate = useNavigate();


  const handleNavigation = async (section: string) => {
    if (section === 'office-information') {
      navigate('/office-information');
      return;
    }
    
    if (section === 'settings') {
      navigate('/settings');
      return;
    }
    
    if (section === 'logout') {
      await signOut();
      toast({
        title: language === 'bn' ? 'লগ আউট' : 'Logout',
        description: language === 'bn' 
          ? 'আপনি সফলভাবে লগ আউট হয়েছেন।'
          : 'You have been successfully logged out.',
      });
      navigate('/login');
      return;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background flex">
        {/* Sidebar */}
        <AppSidebar 
          language={language} 
          onNavigate={handleNavigation}
        />

        {/* Main Content */}
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                <Menu className="h-4 w-4" />
              </SidebarTrigger>
              
              <div className="flex-1" />
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleNavigation('notifications')}
                  className="relative"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
                </Button>
                <LanguageToggle 
                  onLanguageChange={setLanguage} 
                  currentLanguage={language} 
                />
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6">
            <WelcomeHeader language={language} />
            
            <div className="container mx-auto px-4 py-6 space-y-6">
              {/* Quick Stats */}
              <QuickStats language={language} />

              {/* Main Dashboard Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Dashboard Cards */}
                <DashboardCard
                  title={language === 'bn' ? 'ব্যক্তিগত তথ্য' : 'Personal Information'}
                  description={language === 'bn' ? 'আপনার ব্যক্তিগত তথ্য দেখুন এবং আপডেট করুন' : 'View and update your personal information'}
                  icon={User}
                  actionText={language === 'bn' ? 'দেখুন' : 'View'}
                  onAction={() => handleNavigation('settings')}
                  status="completed"
                />

                <DashboardCard
                  title={language === 'bn' ? 'দাপ্তরিক তথ্যাবলি' : 'Office Information'}
                  description={language === 'bn' ? 'আপনার দাপ্তরিক তথ্য পরিচালনা করুন' : 'Manage your office information'}
                  icon={Building2}
                  actionText={language === 'bn' ? 'পরিচালনা করুন' : 'Manage'}
                  onAction={() => handleNavigation('office-information')}
                  status="in-progress"
                />

                <DashboardCard
                  title={language === 'bn' ? 'নথিপত্র' : 'Documents'}
                  description={language === 'bn' ? 'আপনার নথিপত্র দেখুন এবং আপলোড করুন' : 'View and upload your documents'}
                  icon={FileText}
                  actionText={language === 'bn' ? 'দেখুন' : 'View'}
                  onAction={() => handleNavigation('documents')}
                  status="pending"
                  priority
                />

                <DashboardCard
                  title={language === 'bn' ? 'ছুটির আবেদন' : 'Leave Application'}
                  description={language === 'bn' ? 'নতুন ছুটির আবেদন জমা দিন' : 'Submit a new leave application'}
                  icon={Calendar}
                  actionText={language === 'bn' ? 'আবেদন করুন' : 'Apply'}
                  onAction={() => handleNavigation('leave')}
                />
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
