import Layout from "../components/layout/Layout";

export default function Privacy() {
  return (
    <Layout>
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
            WanderQuest stores account and itinerary data to power your trip
            planning experience. We only collect information required to deliver
            core functionality.
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
            You can request account deletion at any time. We continue to improve
            our privacy controls as the platform grows.
          </p>
        </div>
      </main>
    </Layout>
  );
}
