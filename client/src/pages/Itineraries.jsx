import { useState, useEffect } from "react";
import { itineraryService } from "../services";
import { weatherService } from "../services/weather.service";
import { ImageWithFallback, Spinner } from "../components/common";
import Layout from "../components/layout/Layout";
import { Link } from "react-router-dom";

export default function Itineraries() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date"); // 'date' or 'title'
  const [weatherData, setWeatherData] = useState({});

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    const fetchWeatherData = async () => {
      const weatherByTrip = {};
      await Promise.all(
        trips.map(async (trip) => {
          if (!trip.location) return;
          try {
            const data = await weatherService.getWeatherForLocation(trip.location);
            weatherByTrip[trip.id] = {
              ...data,
              list: data.list
                .filter((item) => {
                  const date = new Date(item.dt * 1000);
                  return date.getUTCHours() === 12;
                })
                .slice(0, 5),
            };
          } catch (err) {
            console.error(`Failed to load weather for ${trip.location}:`, err);
          }
        })
      );
      setWeatherData(weatherByTrip);
    };

    if (trips.length > 0) {
      fetchWeatherData();
    }
  }, [trips]);

  const fetchTrips = async () => {
    try {
      const response = await itineraryService.getAllItineraries();
      setTrips(response);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch trips");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await itineraryService.deleteItinerary(id);
      setTrips(trips.filter((item) => item.id !== id));
    } catch (err) {
      setError("Failed to delete itinerary");
    }
  };

  const filteredTrips = trips
    .filter(
      (trip) =>
        trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.startDate) - new Date(a.startDate);
      }
      return a.title.localeCompare(b.title);
    });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-gray-500">
            <Spinner size="lg" />
            <span>Loading itineraries...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-error-600 bg-error-50 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {trips.length >= 3 && (
          <div className="mb-6 rounded-xl border border-success-200 bg-success-50 p-4 dark:border-success-800 dark:bg-success-900/20">
            <p className="text-sm font-medium text-success-800 dark:text-success-200">
              Explorer streak: {trips.length} planned adventures and counting.
            </p>
          </div>
        )}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Itineraries
            </h1>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
              Manage and view all your planned trips
            </p>
          </div>
          <Link to="/create-trip" className="btn-primary">
            Create New Trip
          </Link>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="search-itineraries" className="sr-only">
              Search itineraries
            </label>
            <input
              id="search-itineraries"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search itineraries..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400"
            />
          </div>
          <label htmlFor="sort-itineraries" className="sr-only">
            Sort itineraries
          </label>
          <select
            id="sort-itineraries"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>

        {filteredTrips.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" /* ... */ />
            </div>
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
              No itineraries found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new trip.
            </p>
            <div className="mt-6">
              <Link to="/create-trip" className="btn-primary">
                Create New Trip
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrips.map((trip) => (
              <Link
                key={trip.id}
                to={`/itineraries/${trip.id}`}
                className="card card-interactive block group"
              >
                {trip.placesWithPhotos && trip.placesWithPhotos.length > 0 && (
                  <div className="h-40 w-full overflow-hidden relative">
                    <ImageWithFallback
                      src={
                        trip.placesWithPhotos[0]?.photos?.[0]?.url ||
                        `https://via.placeholder.com/400x200?text=${encodeURIComponent(
                          trip.location
                        )}`
                      }
                      fallbackSrc={trip.placesWithPhotos[0]?.photos?.[0]?.fallback_url}
                      alt={`${trip.location} preview`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      placeholderText={trip.location}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {trip.title}
                      </h3>
                    </div>
                  </div>
                )}

                <div className="p-4">
                  {!trip.placesWithPhotos ||
                  trip.placesWithPhotos.length === 0 ? (
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {trip.title}
                    </h3>
                  ) : null}

                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                      {trip.location}
                    </div>
                    {trip.budget && (
                      <div className="text-sm font-medium text-primary-600 dark:text-primary-400">
                        ${parseFloat(trip.budget).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    {weatherData[trip.id] && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="h-5 w-5 text-orange-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {Math.round(weatherData[trip.id].list[0].main.temp)}°C
                        </span>
                      </div>
                    )}
                    {trip.activities && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        {trip.activities.length}{" "}
                        {trip.activities.length === 1
                          ? "activity"
                          : "activities"}
                      </div>
                    )}
                  </div>

                  {trip.placesWithPhotos &&
                    trip.placesWithPhotos.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                          <svg
                            className="h-5 w-5 text-primary-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                            />
                          </svg>
                          Nearby Places
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {trip.placesWithPhotos.map((place, index) => (
                            <div key={index} className="flex-shrink-0 w-24">
                              <div className="h-16 w-24 rounded-md overflow-hidden">
                                {place.photos && place.photos.length > 0 ? (
                                  <ImageWithFallback
                                    src={place.photos[0].url}
                                    fallbackSrc={place.photos[0].fallback_url}
                                    alt={place.name}
                                    className="w-full h-full object-cover"
                                    placeholderText={place.name.substring(0, 10)}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <svg
                                      className="h-6 w-6 text-gray-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-300 truncate mt-1">
                                {place.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="mt-4 flex justify-end">
                    <span className="text-sm text-primary-600 dark:text-primary-400 font-medium group-hover:underline">
                      View details
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
