import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { itineraryService } from "../services";
import { Button, Input, Spinner } from "../components/common";
import Layout from "../components/layout/Layout";

const INITIAL_FORM_STATE = {
  title: "",
  startDate: "",
  endDate: "",
  budget: "",
  location: "",
  activities: [],
};

const INITIAL_ACTIVITY = {
  day: 1,
  name: "",
  time: "",
};

export default function CreateTrip() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [currentActivity, setCurrentActivity] = useState(INITIAL_ACTIVITY);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const completionSteps = [
    Boolean(formData.title.trim()),
    Boolean(formData.location.trim()),
    Boolean(formData.startDate && formData.endDate),
    Boolean(formData.budget),
  ];
  const completionPercent = Math.round(
    (completionSteps.filter(Boolean).length / completionSteps.length) * 100
  );

  const validate = () => {
    const newErrors = {};
    const { title, startDate, endDate, budget, location } = formData;

    if (!title?.trim()) {
      newErrors.title = "Title is required";
    }

    if (!location?.trim()) {
      newErrors.location = "Location is required";
    }

    if (!startDate) {
      newErrors.startDate = "Start date is required";
    } else if (new Date(startDate) < new Date().setHours(0, 0, 0, 0)) {
      newErrors.startDate = "Start date cannot be in the past";
    }

    if (!endDate) {
      newErrors.endDate = "End date is required";
    } else if (startDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    if (!budget) {
      newErrors.budget = "Budget is required";
    } else if (isNaN(budget) || parseFloat(budget) <= 0) {
      newErrors.budget = "Budget must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const formattedData = {
        ...formData,
        budget: parseFloat(formData.budget).toFixed(2),
        activities: formData.activities.sort((a, b) => a.day - b.day),
        weatherData: {}, // Will be populated by backend
      };

      await itineraryService.createItinerary(formattedData);
      navigate("/itineraries");
    } catch (err) {
      setErrors({
        form: err.response?.data?.error || "Failed to create itinerary",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleActivityChange = (e) => {
    const { name, value } = e.target;
    setCurrentActivity((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addActivity = () => {
    if (!currentActivity.name || !currentActivity.time) return;

    setFormData((prev) => ({
      ...prev,
      activities: [...prev.activities, currentActivity],
    }));
    setCurrentActivity(INITIAL_ACTIVITY);
  };

  const removeActivity = (index) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }));
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setCurrentActivity(INITIAL_ACTIVITY);
    setErrors({});
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="card">
          <div className="px-8 py-10 sm:p-12">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
                Plan Your Trip
              </h1>
              <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
                Fill in the details below to create your perfect itinerary
              </p>
            </div>

            {errors.form && (
              <div className="mb-8 text-error-600 text-sm rounded-lg bg-error-50 p-5 border border-error-200">
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-12">
              <div
                className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 dark:border-primary-800 dark:bg-primary-900/30"
                aria-live="polite"
              >
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-primary-800 dark:text-primary-200">
                    Trip setup progress
                  </span>
                  <span className="text-primary-700 dark:text-primary-300">
                    {completionPercent}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-primary-100 dark:bg-primary-950">
                  <div
                    className="h-2 rounded-full bg-primary-600 transition-all"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
                {completionPercent === 100 && (
                  <p className="mt-2 text-xs font-medium text-success-700 dark:text-success-300">
                    Nice! You unlocked the Planner badge.
                  </p>
                )}
              </div>
              {/* Basic Information Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/50 rounded-full">
                    <svg
                      className="w-6 h-6 text-primary-600 dark:text-primary-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Basic Information
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enter the main details of your trip
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Input
                      id="trip-title"
                      label="Trip Title"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Summer in Paris"
                      error={errors.title}
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      id="trip-budget"
                      label="Budget ($)"
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      placeholder="0.00"
                      error={errors.budget}
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      id="trip-start-date"
                      label="Start Date"
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      error={errors.startDate}
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      id="trip-end-date"
                      label="End Date"
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      error={errors.endDate}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Input
                      id="trip-location"
                      label="Location"
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., Paris, France"
                      error={errors.location}
                    />
                  </div>
                </div>
              </div>

              {/* Activities Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/50 rounded-full">
                    <svg
                      className="w-6 h-6 text-primary-600 dark:text-primary-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Activities
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Plan your daily activities
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    id="activity-day"
                    type="number"
                    name="day"
                    value={currentActivity.day}
                    onChange={handleActivityChange}
                    placeholder="Day"
                    className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                      bg-white dark:bg-gray-700 
                      text-gray-900 dark:text-white 
                      placeholder-gray-400 dark:placeholder-gray-500
                      focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400"
                    min="1"
                  />
                  <input
                    id="activity-name"
                    type="text"
                    name="name"
                    value={currentActivity.name}
                    onChange={handleActivityChange}
                    placeholder="e.g., Visit Eiffel Tower"
                    className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                      bg-white dark:bg-gray-700 
                      text-gray-900 dark:text-white 
                      placeholder-gray-400 dark:placeholder-gray-500
                      focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400"
                  />
                  <input
                    id="activity-time"
                    type="time"
                    name="time"
                    value={currentActivity.time}
                    onChange={handleActivityChange}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                      bg-white dark:bg-gray-700 
                      text-gray-900 dark:text-white 
                      focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400"
                  />
                </div>

                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium 
                    bg-gray-100 dark:bg-gray-900 
                    text-cyan-600 dark:text-cyan-400
                    rounded-lg 
                    border border-gray-200 dark:border-gray-700
                    hover:bg-gray-200 dark:hover:bg-gray-800
                    transition-colors duration-200"
                  onClick={addActivity}
                >
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Activity
                </button>
              </div>

              {/* Activities List */}
              {formData.activities.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Planned Activities ({formData.activities.length})
                  </h4>
                  <div className="space-y-4">
                    {formData.activities.map((activity, index) => (
                      <div
                        key={index}
                        className="card-subtle flex items-center justify-between p-5"
                      >
                        <div className="flex items-center space-x-4">
                          <span className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-lg font-medium">
                            {activity.day}
                          </span>
                          <div>
                            <p className="text-base font-medium text-gray-900">
                              {activity.name}
                            </p>
                            <p className="text-base text-gray-500">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeActivity(index)}
                          className="text-gray-400 hover:text-error-600 transition-colors p-2"
                        >
                          <svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="pt-8 border-t border-gray-200 dark:border-gray-700 flex gap-4 justify-end">
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-lg
                    bg-gray-900 dark:bg-gray-800 
                    text-gray-300 dark:text-gray-400
                    border border-gray-700 dark:border-gray-600
                    hover:bg-gray-800 dark:hover:bg-gray-700
                    transition-colors duration-200"
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg 
                    bg-cyan-600 hover:bg-cyan-700
                    text-white font-medium 
                    transition-colors duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" className="text-white" />
                      Saving...
                    </span>
                  ) : (
                    "Create Trip"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
