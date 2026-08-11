import Navbar from './Navbar';
import Footer from './Footer';

const CustomerLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;
