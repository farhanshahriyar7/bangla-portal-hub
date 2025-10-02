import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PendingApproval() {
  const { user, signOut } = useAuth();
  const [verificationDate, setVerificationDate] = useState<string>('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const checkVerificationStatus = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_verified, verification_requested_at')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking status:', error);
        return;
      }

      if (data?.is_verified) {
        navigate('/');
        return;
      }

      if (data?.verification_requested_at) {
        setVerificationDate(new Date(data.verification_requested_at).toLocaleDateString());
      }
    };

    checkVerificationStatus();

    // Poll for verification status every 30 seconds
    const interval = setInterval(checkVerificationStatus, 30000);

    return () => clearInterval(interval);
  }, [user, navigate]);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Pending Approval</CardTitle>
          <CardDescription>
            Your registration is under review
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Thank you for registering with the Government Portal. Your application has been submitted and is currently under administrative review.
            </p>
            {verificationDate && (
              <p className="text-sm text-muted-foreground">
                <strong>Submitted on:</strong> {verificationDate}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">What happens next?</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>An administrator will review your submitted documents</li>
              <li>You will receive an email notification once your account is approved within 1-2 govt working days</li>
              <li>After approval, you can log in and access the portal</li>
              <li>If you have any questions, please contact support</li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Need help? Contact support at{' '}
              <a href="mailto:support@gov.bd" className="text-primary hover:underline">
                support@nsi.gov.bd
              </a>
            </p>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
