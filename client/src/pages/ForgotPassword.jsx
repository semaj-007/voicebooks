import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import Alert from '../components/Alert.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import Button from '../components/Button.jsx';
import FormField from '../components/FormField.jsx';
import { useForm } from '../hooks/useForm.js';
import { validateForgot } from '../utils/validators.js';

export default function ForgotPassword() {
  const [sent, setSent] = useState(null);

  const form = useForm({
    initialValues: { email: '' },
    validate: validateForgot,
    onSubmit: async (values) => setSent(await api.forgotPassword(values)),
  });

  // The server only returns devResetLink outside production (no email provider is wired up yet).
  const devLink = sent?.devResetLink && new URL(sent.devResetLink);

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email you signed up with and we'll send you a link to choose a new password."
      footer={<Link to="/login">Back to sign in</Link>}
    >
      {sent ? (
        <>
          <Alert type="success">{sent.message}</Alert>
          {devLink && (
            <p className="dev-note">
              Development only: <Link to={devLink.pathname + devLink.search}>open the reset link</Link>
            </p>
          )}
        </>
      ) : (
        <form onSubmit={form.handleSubmit} noValidate>
          <Alert type={form.status?.type}>{form.status?.message}</Alert>
          <FormField label="Email" type="email" inputMode="email" autoComplete="email" {...form.field('email')} />
          <Button type="submit" block loading={form.submitting}>
            {form.submitting ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
