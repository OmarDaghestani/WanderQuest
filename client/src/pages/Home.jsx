import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  GlobeAltIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import Layout from "../components/layout/Layout";

const features = [
  {
    name: "Plan Your Journey",
    description:
      "Create detailed itineraries with our intuitive planning tools.",
    icon: GlobeAltIcon,
  },
  {
    name: "Track Your Budget",
    description:
      "Keep track of expenses and manage your travel budget effectively.",
    icon: CurrencyDollarIcon,
  },
  {
    name: "Organize Activities",
    description: "Schedule and organize your daily activities with ease.",
    icon: CalendarIcon,
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <Layout>
      <main className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ease-in-out">
        <div className="flex-grow">
          {/* Hero Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                <span className="block">Welcome to</span>
                <span className="block text-primary-600 dark:text-primary-400">
                  WanderQuest
                </span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-700 dark:text-gray-200 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Build complete itineraries in minutes, keep every day organized,
                and stay on top of your travel budget from one clean workspace.
              </p>
              <p className="mt-3 max-w-2xl mx-auto text-sm text-gray-500 dark:text-gray-400">
                No clutter, just the details you need to plan confidently.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex justify-center gap-x-6">
                {user ? (
                  <>
                    <Link to="/create-trip" className="btn-primary">
                      Create New Trip
                    </Link>
                    <Link to="/itineraries" className="btn-secondary">
                      View My Trips
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/register" className="btn-primary">
                      Get Started
                    </Link>
                    <Link to="/login" className="btn-secondary">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-6 inline-flex rounded-full bg-primary-50 px-4 py-2 text-xs font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-200">
                Weekly challenge: complete one itinerary to unlock your Explorer badge.
              </div>
            </div>

            {/* Features Section */}
            <div className="mt-32">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => (
                  <div
                    key={feature.name}
                    className="card card-interactive relative p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500"
                  >
                    <div>
                      <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-700 ring-4 ring-white dark:bg-primary-900/30 dark:text-primary-300 dark:ring-gray-800">
                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {feature.name}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
                Trusted by travelers worldwide
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {/* Travelers */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-500 dark:text-primary-400 mb-2">
                    1000+
                  </div>
                  <div className="text-base font-medium text-gray-700 dark:text-gray-200">
                    Travelers
                  </div>
                </div>

                {/* Trips Created */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-500 dark:text-primary-400 mb-2">
                    2000+
                  </div>
                  <div className="text-base font-medium text-gray-700 dark:text-gray-200">
                    Trips Created
                  </div>
                </div>

                {/* Destinations */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-500 dark:text-primary-400 mb-2">
                    3000+
                  </div>
                  <div className="text-base font-medium text-gray-700 dark:text-gray-200">
                    Destinations
                  </div>
                </div>

                {/* Reviews */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-500 dark:text-primary-400 mb-2">
                    4000+
                  </div>
                  <div className="text-base font-medium text-gray-700 dark:text-gray-200">
                    Reviews
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
