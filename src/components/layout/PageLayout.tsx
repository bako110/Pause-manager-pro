
import React from 'react';
import Navbar from './Navbar';
import Header from './Header';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  title, 
  subtitle
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-kimi-green-light">
      <Navbar />
      <main className="flex-grow pt-16">
        {title && <Header title={title} subtitle={subtitle} />}
        <div className="container mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
      <footer className="bg-kimi-green py-6 text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p>© {new Date().getFullYear()} PauseManager Pro. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default PageLayout;
