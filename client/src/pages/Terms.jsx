import Layout from "../components/layout/Layout";

export default function Terms() {
  return (
    <Layout>
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
            By using WanderQuest, you agree to use the service responsibly and
            provide accurate trip information for your own planning needs.
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
            We may update these terms as the product evolves. Continued use of
            the app indicates acceptance of the latest terms.
          </p>
        </div>
      </main>
    </Layout>
  );
}
