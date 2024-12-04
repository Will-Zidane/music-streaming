import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/utils/AuthContext";
import Albums from "@/components/Albums/Albums";

export default function TestPage() {
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

  if (isLoading || authLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Albums />
    </div>
  );
}
