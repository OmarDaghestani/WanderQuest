import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  getPasswordRequirements,
  validateEmail,
  validatePassword,
} from "../utils/validation.utils";
import { ErrorMessages, ErrorTypes, parseApiError } from "../utils/error.utils";
import { Button, Input } from "../components/common";
import Layout from "../components/layout/Layout";

function StatusMessage({ status }) {
  if (!status) return null;
  const isError = status.type === "error";
  return (
    <p
      role={isError ? "alert" : "status"}
      className={`rounded-md px-4 py-3 text-sm ${
        isError
          ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
          : "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      }`}
    >
      {status.message}
    </p>
  );
}

function EmailForm() {
  const { user, updateProfile } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [status, setStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEmail(user?.email || "");
  }, [user?.email]);

  const unchanged = email.trim().toLowerCase() === (user?.email || "").toLowerCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!validateEmail(email)) {
      setStatus({ type: "error", message: ErrorMessages[ErrorTypes.VALIDATION].INVALID_EMAIL });
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({ email: email.trim() });
      setStatus({ type: "success", message: "Email updated." });
    } catch (err) {
      setStatus({ type: "error", message: parseApiError(err).message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-6 sm:p-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Email</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          The address you use to sign in.
        </p>
      </div>
      <Input
        label="Email address"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <StatusMessage status={status} />
      <div className="flex justify-end">
        <Button type="submit" isLoading={isSaving} disabled={isSaving || unchanged}>
          Save email
        </Button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const { changePassword } = useAuth();
  const [fields, setFields] = useState({ current: "", next: "", confirm: "" });
  const [status, setStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const update = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!validatePassword(fields.next)) {
      setStatus({ type: "error", message: getPasswordRequirements() });
      return;
    }
    if (fields.next !== fields.confirm) {
      setStatus({
        type: "error",
        message: ErrorMessages[ErrorTypes.VALIDATION].PASSWORDS_DONT_MATCH,
      });
      return;
    }

    setIsSaving(true);
    try {
      await changePassword(fields.current, fields.next);
      setFields({ current: "", next: "", confirm: "" });
      setStatus({ type: "success", message: "Password changed." });
    } catch (err) {
      setStatus({ type: "error", message: parseApiError(err).message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-6 sm:p-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Password</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Enter your current password to choose a new one.
        </p>
      </div>
      <Input
        label="Current password"
        type="password"
        autoComplete="current-password"
        value={fields.current}
        onChange={update("current")}
        required
      />
      <Input
        label="New password"
        type="password"
        autoComplete="new-password"
        value={fields.next}
        onChange={update("next")}
        helperText={getPasswordRequirements()}
        required
      />
      <Input
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        value={fields.confirm}
        onChange={update("confirm")}
        required
      />
      <StatusMessage status={status} />
      <div className="flex justify-end">
        <Button type="submit" isLoading={isSaving} disabled={isSaving}>
          Change password
        </Button>
      </div>
    </form>
  );
}

export default function Account() {
  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Account</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Manage how you sign in to WanderQuest.</p>
        </div>
        <EmailForm />
        <PasswordForm />
      </div>
    </Layout>
  );
}
