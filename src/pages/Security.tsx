import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, Lock, FileText, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SecurityProps {
  language?: 'bn' | 'en';
}

const Security = ({ language = 'bn' }: SecurityProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingIdProof, setUploadingIdProof] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('passport_photo_url, id_proof_url, full_name')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleNavigate = (section: string) => {
    if (section === 'logout') {
      supabase.auth.signOut();
      navigate('/login');
    } else if (section === 'dashboard') {
      navigate('/');
    } else {
      navigate(`/${section}`);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: language === 'bn' ? "ত্রুটি" : "Error",
        description: language === 'bn' ? "নতুন পাসওয়ার্ড মিলছে না" : "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: language === 'bn' ? "ত্রুটি" : "Error",
        description: language === 'bn' ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" : "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: language === 'bn' ? "সফল" : "Success",
        description: language === 'bn' ? "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে" : "Password updated successfully",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: language === 'bn' ? "ত্রুটি" : "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !user) return;

    const file = event.target.files[0];
    setUploadingPhoto(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('passport-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('passport-photos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ passport_photo_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: language === 'bn' ? "সফল" : "Success",
        description: language === 'bn' ? "ছবি সফলভাবে আপলোড করা হয়েছে" : "Photo uploaded successfully",
      });

      fetchProfileData();
    } catch (error: any) {
      toast({
        title: language === 'bn' ? "ত্রুটি" : "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleIdProofUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !user) return;

    const file = event.target.files[0];
    setUploadingIdProof(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('id-proofs')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('id-proofs')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ id_proof_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: language === 'bn' ? "সফল" : "Success",
        description: language === 'bn' ? "আইডি প্রুফ সফলভাবে আপলোড করা হয়েছে" : "ID proof uploaded successfully",
      });

      fetchProfileData();
    } catch (error: any) {
      toast({
        title: language === 'bn' ? "ত্রুটি" : "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingIdProof(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar language={language} onNavigate={handleNavigate} />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {language === 'bn' ? 'নিরাপত্তা' : 'Security'}
              </h1>
              <p className="text-muted-foreground mt-2">
                {language === 'bn' 
                  ? 'আপনার অ্যাকাউন্ট নিরাপত্তা সেটিংস পরিচালনা করুন' 
                  : 'Manage your account security settings'}
              </p>
            </div>

            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {language === 'bn' ? 'প্রোফাইল ছবি' : 'Profile Picture'}
                </CardTitle>
                <CardDescription>
                  {language === 'bn' 
                    ? 'আপনার প্রোফাইল ছবি আপলোড বা পরিবর্তন করুন' 
                    : 'Upload or change your profile picture'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileData?.passport_photo_url} />
                    <AvatarFallback className="text-2xl">
                      {profileData?.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="photo-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                        {uploadingPhoto ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        {language === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Photo'}
                      </div>
                    </Label>
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {language === 'bn' ? 'JPG, PNG বা GIF (সর্বোচ্চ ২MB)' : 'JPG, PNG or GIF (max 2MB)'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  {language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}
                </CardTitle>
                <CardDescription>
                  {language === 'bn' 
                    ? 'আপনার অ্যাকাউন্ট পাসওয়ার্ড আপডেট করুন' 
                    : 'Update your account password'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">
                    {language === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'}
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={language === 'bn' ? 'নতুন পাসওয়ার্ড লিখুন' : 'Enter new password'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">
                    {language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={language === 'bn' ? 'পাসওয়ার্ড পুনরায় লিখুন' : 'Re-enter password'}
                  />
                </div>
                <Button 
                  onClick={handlePasswordChange} 
                  disabled={loading || !newPassword || !confirmPassword}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Change Password'}
                </Button>
              </CardContent>
            </Card>

            {/* ID Proof */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {language === 'bn' ? 'পরিচয়পত্র প্রমাণ' : 'ID Proof'}
                </CardTitle>
                <CardDescription>
                  {language === 'bn' 
                    ? 'আপনার পরিচয়পত্র ডকুমেন্ট আপলোড করুন' 
                    : 'Upload your identity document'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData?.id_proof_url && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      {language === 'bn' ? 'বর্তমান ডকুমেন্ট' : 'Current Document'}
                    </p>
                    <a 
                      href={profileData.id_proof_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      {language === 'bn' ? 'ডকুমেন্ট দেখুন' : 'View Document'}
                    </a>
                  </div>
                )}
                <div>
                  <Label htmlFor="id-proof-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 inline-flex">
                      {uploadingIdProof ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {language === 'bn' ? 'ডকুমেন্ট আপলোড করুন' : 'Upload Document'}
                    </div>
                  </Label>
                  <Input
                    id="id-proof-upload"
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleIdProofUpload}
                    disabled={uploadingIdProof}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {language === 'bn' 
                      ? 'NID, পাসপোর্ট বা অন্যান্য পরিচয়পত্র (JPG, PNG বা PDF)' 
                      : 'NID, Passport or other ID (JPG, PNG or PDF)'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Security;
