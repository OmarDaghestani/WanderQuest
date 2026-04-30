import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  validateEmail,
  validatePassword,
  getPasswordRequirements,
} from "../../utils/validation.utils";
import {
  parseApiError,
  ErrorTypes,
  ErrorMessages,
} from "../../utils/error.utils";
import { Button } from "../../components/common";
import Layout from "../../components/layout/Layout";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!validateEmail(email)) {
      newErrors.email = ErrorMessages[ErrorTypes.VALIDATION].INVALID_EMAIL;
    }

    if (!validatePassword(password)) {
      newErrors.password =
        ErrorMessages[ErrorTypes.VALIDATION].INVALID_PASSWORD;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword =
        ErrorMessages[ErrorTypes.VALIDATION].PASSWORDS_DONT_MATCH;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register(email, password);
      navigate("/itineraries");
    } catch (err) {
      console.error("Registration error:", err);
      const parsedError = parseApiError(err);
      setErrors({
        form: parsedError.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="card">
          <div className="px-8 py-10 sm:p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
                Create Account
              </h2>
              <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
                Join WanderQuest and start building your next adventure.
              </p>
            </div>

            {errors.form && (
              <div
                id="register-form-error"
                role="alert"
                className="mb-8 text-error-600 dark:text-error-400 text-sm rounded-lg bg-error-50 dark:bg-error-900/50 p-5 border border-error-200 dark:border-error-800"
              >
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <label
                    htmlFor="register-email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email address
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "register-email-error" : undefined}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                      bg-white dark:bg-gray-800 
                      text-gray-900 dark:text-white
                      shadow-sm focus:border-primary-500 focus:ring-primary-500 
                      text-lg py-3"
                    placeholder="you@example.com"
                    autoComplete="username email"
                    required
                  />
                  {errors.email && (
                    <p id="register-email-error" className="mt-2 text-sm text-error-600">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <label
                    htmlFor="register-password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={[
                        errors.password ? "register-password-error" : "",
                        "register-password-hint",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                        bg-white dark:bg-gray-800 
                        text-gray-900 dark:text-white
                        shadow-sm focus:border-primary-500 focus:ring-primary-500 
                        text-lg py-3 pr-10"
                      autoComplete="new-password"
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
                  {errors.password && (
                    <p id="register-password-error" className="mt-2 text-sm text-error-600">
                      {errors.password}
                    </p>
                  )}
                  <p
                    id="register-password-hint"
                    className="mt-1 text-xs text-gray-500 dark:text-gray-400"
                  >
                    {getPasswordRequirements()}
                  </p>
                </div>

                <div className="space-y-4">
                  <label
                    htmlFor="register-confirm-password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      aria-invalid={Boolean(errors.confirmPassword)}
                      aria-describedby={
                        errors.confirmPassword ? "register-confirm-password-error" : undefined
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                        bg-white dark:bg-gray-800 
                        text-gray-900 dark:text-white
                        shadow-sm focus:border-primary-500 focus:ring-primary-500 
                        text-lg py-3 pr-10"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      aria-label={
                        showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p
                      id="register-confirm-password-error"
                      className="mt-2 text-sm text-error-600"
                    >
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full text-lg py-3"
                  isLoading={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center text-sm">
              <p className="text-gray-700 dark:text-gray-300">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Sign in
                </Link>
              </p>

              <p className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                By registering, you agree to our{" "}
                <Link
                  to="/terms"
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
