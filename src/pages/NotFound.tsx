
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import PageLayout from '@/components/layout/PageLayout';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-5xl font-bold text-kimi-orange mb-4">404</h1>
        <p className="text-xl mb-8">Oups ! La page que vous recherchez n'existe pas.</p>
        <Button asChild className="bg-kimi-orange hover:bg-kimi-orange-hover">
          <Link to="/">Retour à l'accueil</Link>
        </Button>
      </div>
    </PageLayout>
  );
};

export default NotFound;
