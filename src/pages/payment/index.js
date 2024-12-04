import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/utils/AuthContext";
import PaymentPage from "@/components/PaypalPage/PayPalPage";

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user) {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, authLoading, router]);

  const handleSuccess = async () => {
    router.push("/");
  };

  if (isLoading || authLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 items-center">
      <PaymentPage />
    </div>
  );
}
