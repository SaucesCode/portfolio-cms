import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";
import PrivateRoute from "./components/layout/PrivateRoute";
import PageTransition from "./components/layout/PageTransition";
import Hero from "./components/sections/Hero";
import Stats from "./components/sections/Stats";
import Projects from "./components/sections/Projects";
import Experience from "./components/sections/Experience";
import SkillsAndCerts from "./components/sections/SkillsAndCerts";
import Testimonials from "./components/sections/Testimonials";
import Blog from "./components/sections/Blog";
import Contact from "./components/sections/Contact";
import BlogPost from "./pages/BlogPost";
import AdminLogin from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import ManageSkills from "./pages/admin/ManageSkills";
import ManageStats from "./pages/admin/ManageStats";
import ManageExperience from "./pages/admin/ManageExperience";
import ManageCertifications from "./pages/admin/ManageCertifications";
import CustomCursor from "./components/effects/CustomCursor";
import ManageHero from "./pages/admin/ManageHero";
import ManageProjects from "./pages/admin/ManageProjects";
import ManageBlog from "./pages/admin/ManageBlog";
import Inbox from "./pages/admin/Inbox";
import ManageTestimonials from "./pages/admin/ManageTestimonials";
import SEO from "./components/SEO";
import { useHero } from "./hooks/useHero";
import ScrollToTop from "./components/ScrollToTop";
import LoadingScreen from "./components/effects/LoadingScreen";

function PublicHome() {
  return (
    <Layout>
      <SEO
        title="James Patrick I. De Mesa — Full-Stack Developer"
        description="I build fast, beautiful web apps. Available for hire."
        url="/"
      />
      <Hero />
      <Projects />
      <SkillsAndCerts />
      <Experience />
      <Testimonials />
      <Blog />
      <Stats />
      <Contact />
    </Layout>
  );
}

function AdminRoutes() {
  return (
    <PrivateRoute>
      <AdminLayout>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="skills" element={<ManageSkills />} />
          <Route path="stats" element={<ManageStats />} />
          <Route path="experience" element={<ManageExperience />} />
          <Route path="certifications" element={<ManageCertifications />} />
          <Route path="testimonials" element={<ManageTestimonials />} />
          <Route path="hero" element={<ManageHero />} />
          <Route path="projects" element={<ManageProjects />} />
          <Route path="blog" element={<ManageBlog />} />
          <Route path="inbox" element={<Inbox />} />
        </Routes>
      </AdminLayout>
    </PrivateRoute>
  );
}

function App() {
  const { isLoading: heroLoading } = useHero();
  const [appReady, setAppReady] = useState(false);
  const location = useLocation();

  // Route-based check, not a hardcoded page list — any future /admin/* route
  // is automatically excluded from the portfolio's loading sequence.
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && (
        <LoadingScreen dataReady={!heroLoading} onComplete={() => setAppReady(true)} />
      )}

      <CustomCursor />
      <ScrollToTop />

      {isAdminRoute ? (
        // Admin: no loading gate, no page-transition wrapper — the dashboard
        // should feel instant, not like part of the portfolio's storytelling.
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <PublicHome />
                </PageTransition>
              }
            />
            <Route
              path="/blog/:slug"
              element={
                <PageTransition>
                  <BlogPost />
                </PageTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      )}
    </>
  );
}

export default App;
