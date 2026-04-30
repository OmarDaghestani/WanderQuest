import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { itineraryService } from "../services";
import { weatherService } from "../services/weather.service";
import { placesService } from "../services/places.service";
import { Button, ImageWithFallback, Spinner } from "../components/common";
import Layout from "../components/layout/Layout";

export default function ItineraryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [placesData, setPlacesData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedItinerary, setEditedItinerary] = useState(null);

  useEffect(() => {
    loadItineraryData();
  }, [id]);

  const loadItineraryData = async () => {
    try {
      const data = await itineraryService.getItineraryById(id);
      setItinerary(data);
      setEditedItinerary(data);

      if (data.location) {
        const [weatherResponse, placesResponse] = await Promise.all([
          weatherService.getWeatherForLocation(data.location),
          placesService.searchPlaces(data.location, "tourist attractions"),
        ]);
        setWeatherData({
          ...weatherResponse,
          list: weatherResponse.list
            .filter((item) => {
              const date = new Date(item.dt * 1000);
              return date.getUTCHours() === 12;
            })
            .slice(0, 5),
        });
        setPlacesData(placesResponse.results.slice(0, 5));
      }
    } catch (err) {
      setError("Failed to load itinerary details");
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditedItinerary(itinerary);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedItinerary((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleActivityChange = (index, field, value) => {
    const updatedActivities = [...editedItinerary.activities];
    updatedActivities[index] = {
      ...updatedActivities[index],
      [field]: value,
    };
    setEditedItinerary((prev) => ({
      ...prev,
      activities: updatedActivities,
    }));
  };

  const handleAddActivity = () => {
    setEditedItinerary((prev) => ({
      ...prev,
      activities: [
        ...prev.activities,
        {
          day: prev.activities.length + 1,
          name: "",
          time: "",
          description: "",
        },
      ],
    }));
  };

  const handleRemoveActivity = (index) => {
    setEditedItinerary((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      const updatedItinerary = await itineraryService.updateItinerary(
        id,
        editedItinerary
      );
      setItinerary(updatedItinerary);
      setIsEditing(false);
      // Reload data to get fresh weather and places data if location changed
      if (updatedItinerary.location !== itinerary.location) {
        await loadItineraryData();
      }
      //send to home page
      navigate("/itineraries");
    } catch (err) {
      setError("Failed to update itinerary");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this itinerary?")) {
      try {
        await itineraryService.deleteItinerary(id);
        navigate("/itineraries");
      } catch (err) {
        setError("Failed to delete itinerary");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const completionScore = itinerary
    ? Math.round(
        (
          [
            Boolean(itinerary.title),
            Boolean(itinerary.location),
            Boolean(itinerary.startDate && itinerary.endDate),
            Boolean(itinerary.budget),
            Boolean(itinerary.activities?.length),
          ].filter(Boolean).length /
          5
        ) * 100
      )
    : 0;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-gray-500">
            <Spinner size="lg" />
            <span>Loading itinerary details...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !itinerary) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-error-600 bg-error-50 px-4 py-3 rounded-lg">
            {error || "Itinerary not found"}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="secondary"
            as={Link}
            to="/itineraries"
            className="group flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <svg
              className="mr-2 h-5 w-5 transform transition-transform group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Itineraries
          </Button>
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={handleEditToggle}
              className="group"
            >
              {isEditing ? "Cancel" : "Edit Itinerary"}
            </Button>
            {isEditing && (
              <Button variant="success" onClick={handleSave} className="group">
                Save Changes
              </Button>
            )}
            <Button variant="error" onClick={handleDelete} className="group">
              Delete
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-primary-100/50 dark:from-primary-900/20 to-primary-50/50 dark:to-primary-900/10">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="edit-title"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Title
                  </label>
                  <input
                    id="edit-title"
                    type="text"
                    name="title"
                    value={editedItinerary.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="edit-start-date"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Start Date
                    </label>
                    <input
                      id="edit-start-date"
                      type="date"
                      name="startDate"
                      value={editedItinerary.startDate.split("T")[0]}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-end-date"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      End Date
                    </label>
                    <input
                      id="edit-end-date"
                      type="date"
                      name="endDate"
                      value={editedItinerary.endDate.split("T")[0]}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="edit-location"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Location
                    </label>
                    <input
                      id="edit-location"
                      type="text"
                      name="location"
                      value={editedItinerary.location}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-budget"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Budget
                    </label>
                    <input
                      id="edit-budget"
                      type="number"
                      name="budget"
                      value={editedItinerary.budget}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {itinerary.title}
                </h1>
                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <svg
                      className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400"
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
                    {formatDate(itinerary.startDate)} -{" "}
                    {formatDate(itinerary.endDate)}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <svg
                      className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400"
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {itinerary.location}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <svg
                      className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Budget: ${parseFloat(itinerary.budget).toLocaleString()}
                  </div>
                </div>
                <div className="mt-4 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 dark:border-primary-800 dark:bg-primary-900/30">
                  <p className="text-sm font-medium text-primary-800 dark:text-primary-200">
                    Completion score: {completionScore}%
                  </p>
                  <p className="mt-1 text-xs text-primary-700 dark:text-primary-300">
                    Keep this itinerary complete to maintain your Explorer streak.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Activities Section */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Activities
              </h2>
              {isEditing && (
                <Button variant="secondary" onClick={handleAddActivity}>
                  Add Activity
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {(isEditing ? editedItinerary : itinerary).activities.map(
                (activity, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg"
                  >
                    {isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Day
                          </label>
                          <input
                            type="number"
                            value={activity.day}
                            onChange={(e) =>
                              handleActivityChange(index, "day", e.target.value)
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Activity
                          </label>
                          <input
                            type="text"
                            value={activity.name}
                            onChange={(e) =>
                              handleActivityChange(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Time
                          </label>
                          <input
                            type="time"
                            value={activity.time}
                            onChange={(e) =>
                              handleActivityChange(
                                index,
                                "time",
                                e.target.value
                              )
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                          </label>
                          <input
                            type="text"
                            value={activity.description || ""}
                            onChange={(e) =>
                              handleActivityChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="error"
                            onClick={() => handleRemoveActivity(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="w-8 h-8 flex-shrink-0 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 flex items-center justify-center font-medium">
                            {activity.day}
                          </span>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {activity.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {activity.time}
                        </span>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Weather Section */}
          {weatherData && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Weather Forecast
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {weatherData.list.map((day, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center"
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {index === 0
                        ? "Today"
                        : new Date(day.dt * 1000).toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                    </p>
                    <img
                      src={`http://openweathermap.org/img/w/${day.weather[0].icon}.png`}
                      alt={day.weather[0].description}
                      className="mx-auto"
                    />
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {Math.round(day.main.temp)}°C
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {day.weather[0].main}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Places Section */}
          {(itinerary.placesWithPhotos || placesData?.length > 0) && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Popular Places Nearby
                </h2>
                <div className="grid gap-6">
                  {(itinerary.placesWithPhotos || placesData || []).map((place, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden shadow-md"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 flex overflow-x-auto">
                          {place.photos && place.photos.length > 0 ? (
                            <div className="flex">
                              {place.photos.map((photo, photoIndex) => (
                                <ImageWithFallback
                                  key={photoIndex}
                                  src={photo.url}
                                  fallbackSrc={photo.fallback_url}
                                  alt={`${place.name} photo ${photoIndex + 1}`}
                                  className="h-48 w-auto object-cover flex-shrink-0"
                                  placeholderText={place.name}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="h-48 w-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              <div className="text-center">
                                <svg
                                  className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                                  No images available
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-4 md:w-2/3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-lg text-gray-900 dark:text-white">
                                {place.name}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {place.formatted_address}
                              </p>
                            </div>
                            <div className="text-sm bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full text-primary-700 dark:text-primary-300">
                              {place.rating ? `${place.rating} ★` : "No rating"}
                            </div>
                          </div>

                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              place.name
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                          >
                            View on Google Maps
                            <svg
                              className="ml-1 h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </Layout>
  );
}
