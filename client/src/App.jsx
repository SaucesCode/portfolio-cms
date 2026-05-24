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
import Dashboard from "./pages/admin/Dashboard";
import ManageSkills from "./pages/admin/ManageSkills";
import CustomCursor from "./components/effects/CustomCursor";

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

        {/* Admin login — public */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin — protected */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute>
              <AdminLayout>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="skills" element={<ManageSkills />} />
                  <Route path="stats" element={<ManageStats />} />
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
