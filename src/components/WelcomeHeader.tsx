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
        
        // If passport photo exists, attempt to resolve a usable URL.
        if (data.passport_photo_url) {
          const rawPath = data.passport_photo_url;

          try {
            // If the stored value is already a full URL, try to use it as-is,
            // but also detect Supabase public storage URLs so we can request
            // a signed URL for private buckets.
            if (/^https?:\/\//i.test(rawPath)) {
              const storageMarker = '/storage/v1/object/public/';
              const markerIndex = rawPath.indexOf(storageMarker);

              if (markerIndex !== -1) {
                // URL looks like: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
                const after = rawPath.slice(markerIndex + storageMarker.length);
                const [bucket, ...rest] = after.split('/');
                const path = rest.join('/');

                try {
                  const { data: signedUrlData, error: signedError } = await supabase.storage
                    .from(bucket)
                    .createSignedUrl(path, 3600);

                  if (!signedError && signedUrlData?.signedUrl) {
                    setAvatarUrl(signedUrlData.signedUrl);
                    // move on
                  } else {
                    // fallback to raw URL
                    setAvatarUrl(rawPath);
                  }
                } catch (err) {
                  console.error('Error requesting signed URL from public storage URL:', err);
                  setAvatarUrl(rawPath);
                }
              } else {
                setAvatarUrl(rawPath);
              }
            } else {
              // Trim leading slashes which break storage APIs
              const path = rawPath.replace(/^\/+/u, '');

              // Try creating a signed URL first (for private buckets)
              const { data: signedUrlData, error: signedError } = await supabase.storage
                .from('passport-photos')
                .createSignedUrl(path, 3600);

              if (signedError) {
                console.error('Error creating signed URL for avatar:', signedError);
              }

              if (signedUrlData?.signedUrl) {
                setAvatarUrl(signedUrlData.signedUrl);
              } else {
                // Fall back to public URL (if the bucket/object is public)
                const { data: publicData } = supabase.storage
                  .from('passport-photos')
                  .getPublicUrl(path);

                if (publicData?.publicUrl) {
                  setAvatarUrl(publicData.publicUrl);
                } else {
                  console.warn('Could not resolve avatar URL for path:', path);
                }
              }
            }
          } catch (err) {
            console.error('Unexpected error resolving avatar URL:', err);
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
        <div className="flex flex-col md:flex-row items-center md:items-center gap-4">
          <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-primary-foreground/20">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground text-lg font-semibold">
              {profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1 text-center md:text-left">{welcomeText}</h1>
            <p className="text-primary-foreground/80 mb-3 text-center md:text-left">{dashboardText}</p>
            
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {profile.employee_id && (
                <Badge variant="secondary" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
                  {profile.employee_id || (language === 'bn' ? 'কর্মচারী আইডি নেই' : 'No Employee ID')}
                </Badge>
              )}

              {profile.designation && (
                <Badge variant="secondary" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:text-primary-foreground/80 hover:bg-green-800">
                  {profile.designation}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="text-sm text-primary-foreground/70 text-center md:text-right mt-3 md:mt-0">
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