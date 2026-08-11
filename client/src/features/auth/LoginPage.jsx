import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineArrowLeft } from 'react-icons/hi';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await login(data);
      toast.success(response.message || 'Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Login failed. Please try again.');
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
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
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
        {/* Subtle warm ambient glow over the whole screen */}
        <div className="absolute inset-0 bg-amber-900/20 mix-blend-overlay pointer-events-none" />
      </div>

      {/* Floating Environmental Elements (Steam/Dust particles catching light) */}
      <motion.div 
        animate={{ y: [-20, -100], opacity: [0, 0.4, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-1/4 right-1/4 w-32 h-64 bg-white/5 blur-2xl rounded-full pointer-events-none -z-10 mix-blend-screen"
      />

      {/* Navigation Return Button */}
      <Link to="/" className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors z-20 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
        <HiOutlineArrowLeft className="w-4 h-4" />
        Return to Homepage
      </Link>

      {/* Glassmorphism Authentication Container */}
      <div className="relative z-10 w-full max-w-md px-4 sm:px-8 lg:ml-[10%] xl:ml-[15%]">
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
            <h2 className="text-2xl font-bold font-display text-white mb-1 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-amber-100/70 text-xs font-medium tracking-wide">
              Where Tradition Meets Technology
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <motion.div variants={fadeInUp}>
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="chef@rasoijunction.com"
                icon={HiOutlineMail}
                register={register}
                required
                variant="glass"
                error={errors.email?.message}
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                icon={HiOutlineLockClosed}
                register={register}
                required
                variant="glass"
                error={errors.password?.message}
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-white/20 bg-dark-900/50 text-amber-500 focus:ring-amber-500/50"
                  {...register('remember')}
                />
                <label htmlFor="remember" className="text-sm text-white/70 hover:text-white cursor-pointer transition-colors">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm font-medium text-amber-400 hover:text-amber-300 hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] transition-all">
                Forgot Password?
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="pt-2">
              <Button
                type="submit"
                size="lg"
                loading={loading}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] transition-all duration-300 border border-white/10"
              >
                LOGIN
              </Button>
            </motion.div>
          </form>

          {/* Demo Credentials */}
          <motion.div
            variants={fadeInUp}
            className="mt-5 p-3 bg-dark-900/50 backdrop-blur-md rounded-2xl border border-white/10 text-left"
          >
            <h3 className="text-[10px] font-semibold text-amber-500/80 uppercase tracking-wider mb-2">Demo Accounts</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div 
                className="p-1.5 rounded bg-white/5 cursor-pointer hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
                onClick={() => { setValue('email', 'customer@demo.com'); setValue('password', 'Demo@123'); }}
              >
                <div className="text-primary-400 font-medium text-[11px]">Customer</div>
                <div className="text-gray-300 text-[9px] truncate">customer@demo.com</div>
              </div>
              <div 
                className="p-1.5 rounded bg-white/5 cursor-pointer hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
                onClick={() => { setValue('email', 'manager@demo.com'); setValue('password', 'Demo@123'); }}
              >
                <div className="text-amber-400 font-medium text-[11px]">Manager</div>
                <div className="text-gray-300 text-[9px] truncate">manager@demo.com</div>
              </div>
              <div 
                className="p-1.5 rounded bg-white/5 cursor-pointer hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
                onClick={() => { setValue('email', 'delivery@demo.com'); setValue('password', 'Demo@123'); }}
              >
                <div className="text-emerald-400 font-medium text-[11px]">Delivery</div>
                <div className="text-gray-300 text-[9px] truncate">delivery@demo.com</div>
              </div>
              <div 
                className="p-1.5 rounded bg-white/5 cursor-pointer hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
                onClick={() => { setValue('email', 'staff@demo.com'); setValue('password', 'Demo@123'); }}
              >
                <div className="text-blue-400 font-medium text-[11px]">Staff</div>
                <div className="text-gray-300 text-[9px] truncate">staff@demo.com</div>
              </div>
              <div 
                className="p-1.5 rounded bg-white/5 cursor-pointer hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 col-span-2"
                onClick={() => { setValue('email', 'chef@demo.com'); setValue('password', 'Demo@123'); }}
              >
                <div className="text-purple-400 font-medium text-[11px]">Chef</div>
                <div className="text-gray-300 text-[9px] truncate">chef@demo.com</div>
              </div>
            </div>
            <div className="text-[9px] text-gray-400/60 mt-1.5 text-center">Passwords: Demo@123</div>
          </motion.div>

          {/* Registration Link */}
          <motion.div variants={fadeInUp} className="mt-5 text-center border-t border-white/10 pt-4">
            <p className="text-sm text-white/60">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-amber-400 hover:text-amber-300 font-bold hover:underline underline-offset-4 transition-all"
              >
                Create Account
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
