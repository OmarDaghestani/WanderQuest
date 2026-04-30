import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Spinner } from "./components/common";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const Itineraries = lazy(() => import("./pages/Itineraries"));
const CreateTrip = lazy(() => import("./pages/CreateTrip"));
const ItineraryDetails = lazy(() => import("./pages/ItineraryDetails"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));

const PageFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
      <Spinner size="lg" />
      <span>Loading page...</span>
    </div>
  </div>
);

function App() {
  const router = createBrowserRouter(
    [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/terms",
        element: <Terms />,
      },
      {
        path: "/privacy",
        element: <Privacy />,
      },
      {
        path: "/itineraries",
        element: (
          <ProtectedRoute>
            <Itineraries />
          </ProtectedRoute>
        ),
      },
      {
        path: "/create-trip",
        element: (
          <ProtectedRoute>
            <CreateTrip />
          </ProtectedRoute>
        ),
      },
      {
        path: "/itineraries/:id",
        element: (
          <ProtectedRoute>
            <ItineraryDetails />
          </ProtectedRoute>
        ),
      },
    ],
    {
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      },
    }
  );

  return (
    <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={<PageFallback />}>
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
