import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import { HiOutlineLockClosed } from 'react-icons/hi';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      toast.success('Password reset successfully! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/">
            <img src="/logo.png" alt="Rasoi Junction" className="h-20 w-20 mx-auto mb-6 rounded-2xl object-cover bg-white dark:bg-white shadow-md" />
          </Link>
          <h1 className="text-2xl font-bold font-display text-dark-800 dark:text-white mb-2">
            Reset Password
          </h1>
          <p className="text-gray-500 dark:text-dark-400">
            Enter your new password below.
          </p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="New Password"
              name="password"
              type="password"
              placeholder="Min 6 characters"
              icon={HiOutlineLockClosed}
              register={register}
              required
              error={errors.password?.message}
            />

            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              icon={HiOutlineLockClosed}
              register={register}
              required
              error={errors.confirmPassword?.message}
            />

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Reset Password
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
            ← Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
