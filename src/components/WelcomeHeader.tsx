import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface WelcomeHeaderProps {
  language: 'bn' | 'en';
}

interface ProfileData {
  full_name: string;
  employee_id: string | null;
  department: string | null;
  designation: string | null;
  created_at: string;
  passport_photo_url: string | null;
}

export const WelcomeHeader = ({ language }: WelcomeHeaderProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, employee_id, department, designation, created_at, passport_photo_url')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile(data);
        
        // If passport photo exists, get signed URL
        if (data.passport_photo_url) {
          const { data: signedUrlData } = await supabase.storage
            .from('passport-photos')
            .createSignedUrl(data.passport_photo_url, 3600);
          
          if (signedUrlData?.signedUrl) {
            setAvatarUrl(signedUrlData.signedUrl);
          }
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (language === 'bn') {
      return date.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <Card className="shadow-card bg-gradient-primary text-primary-foreground">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  const welcomeText = language === 'bn' 
    ? `স্বাগতম, ${profile.full_name}` 
    : `Welcome, ${profile.full_name}`;

  const dashboardText = language === 'bn' 
    ? 'আপনার ব্যক্তিগত ড্যাশবোর্ড' 
    : 'Your Personal Dashboard';

  return (
    <Card className="shadow-card bg-gradient-primary text-primary-foreground">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary-foreground/20">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground text-lg font-semibold">
              {profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{welcomeText}</h1>
            <p className="text-primary-foreground/80 mb-3">{dashboardText}</p>
            
            <div className="flex flex-wrap gap-2">
              {profile.employee_id && (
                <Badge variant="secondary" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
                  {profile.employee_id}
                </Badge>
              )}
              {profile.designation && (
                <Badge variant="secondary" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
                  {profile.designation}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="text-right text-sm text-primary-foreground/70">
            {profile.department && <p className="font-medium">{profile.department}</p>}
            <p className="mt-1">
              {language === 'bn' ? 'যোগদানের তারিখ: ' : 'Joined: '}{formatDate(profile.created_at)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};