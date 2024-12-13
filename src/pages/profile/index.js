import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/utils/AuthContext';
import UserEditForm from '@/components/UserEditForm/UserEditForm';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      document.title = 'Profile'; // Set tab to "Profile" when authenticated
    } else {
      document.title = 'Login'; // Set tab to "Login" if not authenticated
    }
  }, [isAuthenticated]);



  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user) {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, authLoading, router]);

  const handleSuccess = async () => {
    router.push('/');
  };

  if (isLoading || authLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <UserEditForm
        userId={user?.id}
        onSuccess={handleSuccess}
        isProfileEdit={true}
      />
    </div>
  );
}