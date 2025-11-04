import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [checkingVerification, setCheckingVerification] = useState(true);

  useEffect(() => {
    // Always start by checking 
    setCheckingVerification(true);
    if (loading) {
      // keep checkingVerification true while auth is loading
      return;
    }

    // if there is no user, no need to check verification
    if (!user) {
      setCheckingVerification(false);
      setIsVerified(false);
      return;
    }

    const checkVerification = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_verified')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking verification:', error);
          setIsVerified(false);
        } else {
          // setIsVerified(data?.is_verified || false);
          setIsVerified(Boolean(data?.is_verified)); // ensure it's a boolean
        }
      } catch (error) {
        console.error('Error:', error);
        setIsVerified(false);
      } finally {
        setCheckingVerification(false);
      }
    };

    // start the verification check
    setCheckingVerification(true);
    checkVerification();
  }, [user, loading]);

  if (loading || checkingVerification) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isVerified) {
    return <Navigate to="/pending-approval" replace />;
  }

  return <>{children}</>;
};
