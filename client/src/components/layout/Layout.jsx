import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Navbar />
      <main className="flex-1">
        {/* pt-20 pushes content below the fixed navbar */}
        {children}
      </main>
      <Footer />
    </div>
  );
}
