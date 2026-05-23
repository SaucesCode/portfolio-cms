import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
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
import CustomCursor from "./components/effects/CustomCursor";

function App() {
  return (
    <>
      <CustomCursor />
      <Routes>
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
      </Routes>
    </>
  );
}

export default App;
