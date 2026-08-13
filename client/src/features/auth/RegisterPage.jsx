import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlinePhone, HiOutlineArrowLeft } from 'react-icons/hi';

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      toast.success('Account created successfully! Welcome to Rasoi Junction 🎉');
      navigate('/customer/dashboard');
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-start overflow-hidden font-sans text-gray-200">
      {/* Background Video / Fallback Image */}
      <div className="absolute inset-0 w-full h-full -z-20 bg-black">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          poster="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1920&q=80"
          className="object-cover w-full h-full scale-105 transform origin-center animate-subtle-zoom opacity-70"
        >
          <source src="https://cdn.pixabay.com/video/2021/08/04/83864-584742634_large.mp4" type="video/mp4" />
        </video>
        {/* Environmental Overlay - Dark gradient on the left side to ensure UI readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950/95 via-dark-900/80 to-transparent pointer-events-none" />
        {/* Subtle warm ambient glow */}
        <div className="absolute inset-0 bg-amber-900/20 mix-blend-overlay pointer-events-none" />
      </div>

      {/* Floating Environmental Elements (Steam/Dust particles catching light) */}
      <motion.div
        animate={{ y: [-20, -120], opacity: [0, 0.5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'linear', delay: 2 }}
        className="absolute bottom-1/3 right-1/3 w-40 h-40 bg-white/5 blur-3xl rounded-full pointer-events-none -z-10 mix-blend-screen"
      />

      {/* Navigation Return Button */}
      <Link to="/" className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors z-20 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
        <HiOutlineArrowLeft className="w-4 h-4" />
        Return to Homepage
      </Link>

      {/* Glassmorphism Authentication Container */}
      <div className="relative z-10 w-full max-w-md px-6 sm:px-12 lg:ml-[10%] xl:ml-[15%] my-12 lg:my-0">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="w-full relative glass-card bg-dark-950/40 border border-white/10 p-6 sm:p-8 rounded-[2rem] shadow-2xl backdrop-blur-2xl backdrop-saturate-150"
          style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255,255,255,0.1)' }}
        >
          {/* Logo & Header */}
          <motion.div variants={fadeInUp} className="text-center mb-6">
            <div className="relative inline-block mb-3">
              <div className="absolute inset-0 bg-amber-500/30 blur-xl rounded-full" />
              <img src="/logo.png" alt="Rasoi Junction" className="relative h-16 w-16 mx-auto rounded-full object-cover border-2 border-white/20 shadow-lg" />
            </div>
            <h2 className="text-3xl font-bold font-display text-white mb-1 tracking-tight">
              Create Your Account
            </h2>
            <p className="text-amber-100/70 text-sm font-medium tracking-wide">
              Where Tradition Meets Technology
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <motion.div variants={fadeInUp}>
              <Input
                label="Full Name"
                name="name"
                placeholder="Enter Your Name"
                icon={HiOutlineUser}
                register={register}
                required
                variant="glass"
                error={errors.name?.message}
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="email@example.com"
                icon={HiOutlineMail}
                register={register}
                required
                variant="glass"
                error={errors.email?.message}
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                placeholder="1234567890"
                icon={HiOutlinePhone}
                register={register}
                variant="glass"
                error={errors.phone?.message}
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Min 6 characters"
                icon={HiOutlineLockClosed}
                register={register}
                required
                variant="glass"
                error={errors.password?.message}
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                icon={HiOutlineLockClosed}
                register={register}
                required
                variant="glass"
                error={errors.confirmPassword?.message}
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="acceptTerms"
                className="mt-1 w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-white/10 border-white/20"
                {...register('acceptTerms', { required: 'You must accept the terms and conditions' })}
              />
              <div className="flex flex-col">
                <label htmlFor="acceptTerms" className="text-sm text-white/70">
                  I agree to the{' '}
                  <Link to="/privacy-policy" className="text-amber-400 hover:text-amber-300 font-semibold hover:underline">Privacy Policy</Link>
                  {' '}and{' '}
                  <Link to="/terms-of-service" className="text-amber-400 hover:text-amber-300 font-semibold hover:underline">Terms & Conditions</Link>
                </label>
                {errors.acceptTerms && <p className="text-red-400 text-xs mt-1">{errors.acceptTerms.message}</p>}
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="pt-2">
              <Button
                type="submit"
                size="lg"
                loading={loading}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] transition-all duration-300 border border-white/10"
              >
                CREATE ACCOUNT
              </Button>
            </motion.div>
          </form>

          {/* Login Link */}
          <motion.div variants={fadeInUp} className="mt-6 text-center border-t border-white/10 pt-5">
            <p className="text-sm text-white/60">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-amber-400 hover:text-amber-300 font-bold hover:underline underline-offset-4 transition-all"
              >
                Login              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
