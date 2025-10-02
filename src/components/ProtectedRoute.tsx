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
    if (!user) {
      setCheckingVerification(false);
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
          setIsVerified(data?.is_verified || false);
        }
      } catch (error) {
        console.error('Error:', error);
        setIsVerified(false);
      } finally {
        setCheckingVerification(false);
      }
    };

    checkVerification();
  }, [user]);

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
