import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineCheckCircle, HiOutlineLockClosed, HiOutlineKey, HiOutlineExclamationCircle } from 'react-icons/hi';
import Modal from '../../components/ui/Modal';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP + New Password
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);
  
  const navigate = useNavigate();
  
  const { register: registerStep1, handleSubmit: handleSubmitStep1, formState: { errors: errorsStep1 } } = useForm();
  const { register: registerStep2, handleSubmit: handleSubmitStep2, formState: { errors: errorsStep2 } } = useForm();

  const onRequestOtp = async (data) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setUserEmail(data.email);
      setStep(2);
      toast.success('OTP sent to your email!');
    } catch (error) {
      if (error.response?.status === 404 || error.message === 'User not found.') {
        setUserEmail(data.email);
        setShowNotFoundModal(true);
      } else {
        toast.error(error.message || 'Failed to send OTP.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (data) => {
    setLoading(true);
    try {
      await authService.resetPassword(userEmail, data.otp, data.password);
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (error) {
      toast.error(error.message || 'Failed to reset password.');
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

          {success ? (
            <>
              <div className="w-16 h-16 bg-success-50 dark:bg-success-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HiOutlineCheckCircle className="w-8 h-8 text-success-500" />
              </div>
              <h1 className="text-2xl font-bold font-display text-dark-800 dark:text-white mb-2">
                Password Reset Successful!
              </h1>
              <p className="text-gray-500 dark:text-dark-400">
                Your password has been changed. Redirecting to login page...
              </p>
            </>
          ) : step === 1 ? (
            <>
              <h1 className="text-2xl font-bold font-display text-dark-800 dark:text-white mb-2">
                Forgot Password
              </h1>
              <p className="text-gray-500 dark:text-dark-400">
                Enter your email address to receive a 6-digit verification code.
              </p>
            </>
          ) : (
             <>
              <h1 className="text-2xl font-bold font-display text-dark-800 dark:text-white mb-2">
                Enter Verification Code
              </h1>
              <p className="text-gray-500 dark:text-dark-400">
                We sent a 6-digit code to <strong>{userEmail}</strong>
              </p>
            </>
          )}
        </div>

        {!success && step === 1 && (
          <div className="card p-6">
            <form onSubmit={handleSubmitStep1(onRequestOtp)} className="space-y-4">
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="you@example.com"
                icon={HiOutlineMail}
                register={registerStep1}
                required
                error={errorsStep1.email?.message}
              />

              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                Send OTP Code
              </Button>
            </form>
          </div>
        )}

        {!success && step === 2 && (
          <div className="card p-6">
            <form onSubmit={handleSubmitStep2(onResetPassword)} className="space-y-4">
              <Input
                label="6-Digit OTP Code"
                name="otp"
                type="text"
                placeholder="Enter 6-digit code"
                icon={HiOutlineKey}
                register={registerStep2}
                required
                error={errorsStep2.otp?.message}
              />

              <Input
                label="New Password"
                name="password"
                type="password"
                placeholder="Enter new password"
                icon={HiOutlineLockClosed}
                register={registerStep2}
                required
                error={errorsStep2.password?.message}
              />

              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                Reset Password
              </Button>
            </form>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            ← Back to Sign In
          </Link>
        </div>
      </motion.div>

      <Modal
        isOpen={showNotFoundModal}
        onClose={() => setShowNotFoundModal(false)}
        title="Account Not Found"
        size="md"
      >
        <div className="text-center p-4">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineExclamationCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We couldn't find an account associated with <strong>{userEmail}</strong>. Would you like to create a new account with this email address?
          </p>
          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              onClick={() => navigate('/register', { state: { email: userEmail } })}
              className="w-full"
            >
              Create Account
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowNotFoundModal(false)}
              className="w-full"
            >
              Try Another Email
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ForgotPasswordPage;
