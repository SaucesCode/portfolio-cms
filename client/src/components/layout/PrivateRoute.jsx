import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // Still checking session on app load — show spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Not logged in — redirect to login page
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Logged in — render the protected page
  return children;
}
