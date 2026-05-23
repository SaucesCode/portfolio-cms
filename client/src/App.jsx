import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";
import PrivateRoute from "./components/layout/PrivateRoute";
import Hero from "./components/sections/Hero";
import Stats from "./components/sections/Stats";
import Projects from "./components/sections/Projects";
import Skills from "./components/sections/Skills";
import Experience from "./components/sections/Experience";
import Certifications from "./components/sections/Certifications";
import Testimonials from "./components/sections/Testimonials";
import Blog from "./components/sections/Blog";
import Contact from "./components/sections/Contact";
import BlogPost from "./pages/BlogPost";
import AdminLogin from "./pages/admin/Login";
import CustomCursor from "./components/effects/CustomCursor";

// Placeholder — we'll replace with real pages in Step 4.2
function AdminDashboard() {
  return <h1 className="text-white text-2xl font-bold">Dashboard</h1>;
}

function App() {
  return (
    <>
      <CustomCursor />
      <Routes>
        {/* Public portfolio */}
        <Route
          path="/"
          element={
            <Layout>
              <Hero />
              <Stats />
              <Projects />
              <Skills />
              <Experience />
              <Certifications />
              <Testimonials />
              <Blog />
              <Contact />
            </Layout>
          }
        />
        <Route path="/blog/:slug" element={<BlogPost />} />

        {/* Admin — login is public */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin — everything else is protected */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute>
              <AdminLayout>
                <Routes>
                  <Route index element={<AdminDashboard />} />
                </Routes>
              </AdminLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
