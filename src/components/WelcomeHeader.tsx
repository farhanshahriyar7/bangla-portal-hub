import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface WelcomeHeaderProps {
  language: 'bn' | 'en';
}

export const WelcomeHeader = ({ language }: WelcomeHeaderProps) => {
  const employeeData = {
    name: language === 'bn' ? 'মোহাম্মদ রহিম উদ্দিন' : 'Mohammad Rahim Uddin',
    employeeId: 'EMP-2024-0158',
    department: language === 'bn' ? 'তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ' : 'Information & Communication Technology Division',
    designation: language === 'bn' ? 'সহকারী প্রোগ্রামার' : 'Assistant Programmer',
    joinDate: language === 'bn' ? '১৫ জানুয়ারি, ২০২২' : 'January 15, 2022'
  };

  const welcomeText = language === 'bn' 
    ? `স্বাগতম, ${employeeData.name}` 
    : `Welcome, ${employeeData.name}`;

  const dashboardText = language === 'bn' 
    ? 'আপনার ব্যক্তিগত ড্যাশবোর্ড' 
    : 'Your Personal Dashboard';

  return (
    <Card className="shadow-card bg-gradient-primary text-primary-foreground">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary-foreground/20">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground text-lg font-semibold">
              {employeeData.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{welcomeText}</h1>
            <p className="text-primary-foreground/80 mb-3">{dashboardText}</p>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
                {employeeData.employeeId}
              </Badge>
              <Badge variant="secondary" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
                {employeeData.designation}
              </Badge>
            </div>
          </div>
          
          <div className="text-right text-sm text-primary-foreground/70">
            <p className="font-medium">{employeeData.department}</p>
            <p className="mt-1">
              {language === 'bn' ? 'যোগদানের তারিখ: ' : 'Joined: '}{employeeData.joinDate}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};