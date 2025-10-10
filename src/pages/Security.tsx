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

interface ProfileData {
  passport_photo_url?: string | null;
  id_proof_url?: string | null;
  full_name?: string | null;
}

const Security = ({ language = 'bn' }: SecurityProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingIdProof, setUploadingIdProof] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | 'other' | null>(null);

  const detectFileType = (url: string | undefined | null) => {
    if (!url) return 'other' as const;
    const lower = url.split('?')[0].split('#')[0].toLowerCase();
    if (lower.match(/\.(jpg|jpeg|png|gif|webp)$/)) return 'image' as const;
    if (lower.match(/\.(pdf)$/)) return 'pdf' as const;
    // try mime from data url or fallback
    return 'other' as const;
  };

  const openPreview = (url: string) => {
    setPreviewType(detectFileType(url));
    setPreviewUrl(url);
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewType(null);
  };

  // memoize to avoid effect dependency issues
  const fetchProfileDataCb = async () => await fetchProfileData();
  useEffect(() => {
    fetchProfileDataCb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const resolved: ProfileData = { ...(data as ProfileData) };

      // Resolve passport photo URL
      if (data?.passport_photo_url) {
        const raw = data.passport_photo_url;
        if (/^https?:\/\//i.test(raw)) {
          // public or full URL — use as-is
          resolved.passport_photo_url = raw;
        } else {
          // assume storage path in 'passport-photos' bucket
          const path = raw.replace(/^\/+/, '');
          try {
            const { data: signedData, error: signErr } = await supabase.storage
              .from('passport-photos')
              .createSignedUrl(path, 3600);
            if (!signErr && signedData?.signedUrl) {
              resolved.passport_photo_url = signedData.signedUrl;
            } else {
              const { data: publicData } = supabase.storage.from('passport-photos').getPublicUrl(path);
              resolved.passport_photo_url = publicData?.publicUrl || raw;
            }
          } catch (err) {
            resolved.passport_photo_url = raw;
          }
        }
      }

      // Resolve id proof URL
      if (data?.id_proof_url) {
        const raw = data.id_proof_url;
        if (/^https?:\/\//i.test(raw)) {
          resolved.id_proof_url = raw;
        } else {
          const path = raw.replace(/^\/+/, '');
          try {
            const { data: signedData, error: signErr } = await supabase.storage
              .from('id-proofs')
              .createSignedUrl(path, 3600);
            if (!signErr && signedData?.signedUrl) {
              resolved.id_proof_url = signedData.signedUrl;
            } else {
              const { data: publicData } = supabase.storage.from('id-proofs').getPublicUrl(path);
              resolved.id_proof_url = publicData?.publicUrl || raw;
            }
          } catch (err) {
            resolved.id_proof_url = raw;
          }
        }
      }

      setProfileData(resolved);
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
    } catch (err: unknown) {
      const getMsg = (e: unknown) => {
        if (!e) return 'Unknown error';
        if (typeof e === 'string') return e;
        if (typeof e === 'object' && e !== null) {
          const maybe = e as { message?: unknown };
          if (typeof maybe.message === 'string') return maybe.message;
        }
        return String(e);
      };
      const msg = getMsg(err);
      toast({
        title: language === 'bn' ? "ত্রুটি" : "Error",
        description: msg,
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

      if (updateError) {
        // Likely RLS policy prevented the update. Show the uploaded image immediately
        // using the storage publicUrl so the user sees their upload, and notify about RLS.
        console.warn('Profile update failed after storage upload:', updateError);
        setProfileData(prev => ({ ...(prev || {}), passport_photo_url: publicUrl }));
        toast({
          title: language === 'bn' ? "অংশিক সফলতা" : "Partial success",
          description: language === 'bn'
            ? 'ফাইল স্টোরেজে আপলোড হয়েছে কিন্তু ডাটাবেস আপডেট করতে ব্যর্থ হয়েছে (RLS)। অ্যাডমিনের সঙ্গে যোগাযোগ করুন বা পলিসি আপডেট করুন।'
            : 'File uploaded to storage but updating profile in the database failed due to RLS. Contact your admin or update the policy.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: language === 'bn' ? "সফল" : "Success",
          description: language === 'bn' ? "ছবি সফলভাবে আপলোড করা হয়েছে" : "Photo uploaded successfully",
        });
      }

      // Refresh profile info (will include DB value if update succeeded)
      fetchProfileData();
    } catch (err: unknown) {
      const getMsg = (e: unknown) => {
        if (!e) return 'Unknown error';
        if (typeof e === 'string') return e;
        if (typeof e === 'object' && e !== null) {
          const maybe = e as { message?: unknown };
          if (typeof maybe.message === 'string') return maybe.message;
        }
        return String(e);
      };
      const msg = getMsg(err);
      toast({
        title: language === 'bn' ? "ত্রুটি" : "Error",
        description: msg,
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

      if (updateError) {
        console.warn('Profile id_proof update failed after storage upload:', updateError);
        setProfileData(prev => ({ ...(prev || {}), id_proof_url: publicUrl }));
        toast({
          title: language === 'bn' ? "অংশিক সফলতা" : "Partial success",
          description: language === 'bn'
            ? 'ডকুমেন্ট স্টোরেজে আপলোড হয়েছে কিন্তু ডাটাবেস আপডেট করতে ব্যর্থ হয়েছে (RLS)। অ্যাডমিনের সঙ্গে যোগাযোগ করুন বা পলিসি আপডেট করুন।'
            : 'Document uploaded to storage but updating profile in the database failed due to RLS. Contact your admin or update the policy.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: language === 'bn' ? "সফল" : "Success",
          description: language === 'bn' ? "আইডি প্রুফ সফলভাবে আপলোড করা হয়েছে" : "ID proof uploaded successfully",
        });
      }

      fetchProfileData();
    } catch (err: unknown) {
      const getMsg = (e: unknown) => {
        if (!e) return 'Unknown error';
        if (typeof e === 'string') return e;
        if (typeof e === 'object' && e !== null) {
          const maybe = e as { message?: unknown };
          if (typeof maybe.message === 'string') return maybe.message;
        }
        return String(e);
      };
      const msg = getMsg(err);
      toast({
        title: language === 'bn' ? "ত্রুটি" : "Error",
        description: msg,
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
                    <div className="flex items-center gap-3">
                      {detectFileType(profileData.id_proof_url) === 'image' ? (
                        <img src={profileData.id_proof_url} alt="id-proof" className="h-16 w-16 object-cover rounded" />
                      ) : detectFileType(profileData.id_proof_url) === 'pdf' ? (
                        <div className="h-16 w-16 bg-slate-50 rounded flex items-center justify-center text-sm">PDF</div>
                      ) : (
                        <div className="h-16 w-16 bg-slate-50 rounded flex items-center justify-center text-sm">File</div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <a
                            href={profileData.id_proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm"
                          >
                            {language === 'bn' ? 'ডকুমেন্ট দেখুন' : 'View Document'}
                          </a>
                          <button
                            type="button"
                            onClick={() => openPreview(profileData.id_proof_url)}
                            className="text-sm text-muted-foreground underline"
                          >
                            {language === 'bn' ? 'প্রিভিউ' : 'Preview'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <Label htmlFor="id-proof-upload" className="cursor-pointer">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
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
            {/* Preview Modal */}
            {previewUrl && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closePreview}>
                <div className="bg-white max-w-3xl w-full max-h-[80vh] overflow-auto p-4 rounded" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end mb-2">
                    <button onClick={closePreview} className="text-muted-foreground">Close</button>
                  </div>
                  {previewType === 'image' && <img src={previewUrl} alt="preview" className="w-full h-auto" />}
                  {previewType === 'pdf' && (
                    <iframe title="pdf-preview" src={previewUrl} className="w-full h-[70vh]" />
                  )}
                  {previewType === 'other' && (
                    <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-primary">Open file</a>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Security;
