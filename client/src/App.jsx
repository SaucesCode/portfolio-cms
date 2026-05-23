import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <div className="flex items-center justify-center min-h-[60vh]">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Portfolio coming soon 🚀
              </h1>
            </div>
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;
