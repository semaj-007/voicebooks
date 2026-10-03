import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import Alert from '../components/Alert.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import Button from '../components/Button.jsx';
import FormField from '../components/FormField.jsx';
import PasswordRules from '../components/PasswordRules.jsx';
import { useForm } from '../hooks/useForm.js';
import { validateReset } from '../utils/validators.js';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const validToken = /^[a-f0-9]{64}$/.test(token);

  const form = useForm({
    initialValues: { password: '', confirmPassword: '' },
    validate: validateReset,
    onSubmit: async (values) => {
      await api.resetPassword({ token, ...values });
      navigate('/login', { replace: true, state: { notice: 'Password updated. Sign in with your new password.' } });
    },
  });

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Pick something you don't use anywhere else."
      footer={<Link to="/login">Back to sign in</Link>}
    >
      {!validToken ? (
        <Alert type="error">
          This reset link is incomplete. <Link to="/forgot-password">Request a new link</Link>
        </Alert>
      ) : (
        <form onSubmit={form.handleSubmit} noValidate>
          <Alert type={form.status?.type}>
            {form.status?.message}
            {form.status?.type === 'error' && form.status.message.includes('expired') && (
              <> <Link to="/forgot-password">Request a new link</Link></>
            )}
          </Alert>
          <FormField label="New password" type="password" autoComplete="new-password" {...form.field('password')} />
          <PasswordRules password={form.values.password} />
          <FormField label="Confirm new password" type="password" autoComplete="new-password" {...form.field('confirmPassword')} />
          <Button type="submit" block loading={form.submitting}>
            {form.submitting ? 'Saving…' : 'Save new password'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
