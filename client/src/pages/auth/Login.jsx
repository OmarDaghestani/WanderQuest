import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { validateEmail } from "../../utils/validation.utils";
import { parseApiError, ErrorTypes, ErrorMessages } from "../../utils/error.utils";
import { Button } from "../../components/common";
import Layout from "../../components/layout/Layout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const emailErrorId = error ? "login-form-error" : undefined;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/itineraries");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate email
    if (!validateEmail(email)) {
      setError(ErrorMessages[ErrorTypes.VALIDATION].INVALID_EMAIL);
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password);
      // Navigation will be handled by the useEffect above
    } catch (err) {
      console.error("Login error:", err);
      const parsedError = parseApiError(err);
      setError(parsedError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl">
          <div className="px-8 py-10 sm:p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
                Welcome Back
              </h2>
              <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
                Sign in to continue planning and tracking your trips.
              </p>
            </div>

            {/* Show error message if exists */}
            {error && (
              <div
                id="login-form-error"
                role="alert"
                className="mb-6 p-4 rounded-md bg-error-50 dark:bg-error-900/50 
                border border-error-200 dark:border-error-800"
              >
                <p className="text-sm text-error-600 dark:text-error-400">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-describedby={emailErrorId}
                  aria-invalid={Boolean(error)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                    bg-white dark:bg-gray-800 shadow-sm focus:border-primary-500 
                    focus:ring-primary-500 text-lg py-3"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-4">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-describedby={emailErrorId}
                    aria-invalid={Boolean(error)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                      bg-white dark:bg-gray-800 shadow-sm focus:border-primary-500 
                      focus:ring-primary-500 text-lg py-3 pr-10"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Add this section after the form */}
            <div className="mt-8 text-center text-sm">
              <p className="text-gray-600 dark:text-gray-300">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
