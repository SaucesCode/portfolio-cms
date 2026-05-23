import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Hero from "./components/sections/Hero";
import Projects from "./components/sections/Projects";
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
              <Projects />
            </Layout>
          }
        />
      </Routes>
    </>
  );
}

export default App;
