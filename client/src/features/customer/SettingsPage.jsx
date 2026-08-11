import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlineKey, HiOutlineCog, HiOutlineBell } from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const handleUpdateProfile = (data) => {
    toast.success('Profile settings updated successfully! (Simulated)');
  };

  const handleUpdatePassword = (data) => {
    toast.success('Password updated successfully! (Simulated)');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-dark-800 dark:text-white">Account Preferences & Settings</h1>
          <p className="text-sm text-gray-500 dark:text-dark-400">Configure your profile, security limits, and notification criteria.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Menu selection panel */}
          <div className="md:col-span-1 space-y-3">
            <Card className="p-4 space-y-1">
              <button className="w-full text-left px-3 py-2 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-500 font-semibold text-sm flex items-center gap-2">
                <HiOutlineUser className="w-4 h-4" /> Personal Profile
              </button>
              <button className="w-full text-left px-3 py-2 rounded-xl text-gray-500 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-800/50 text-sm flex items-center gap-2">
                <HiOutlineKey className="w-4 h-4" /> Security & Passwords
              </button>
              <button className="w-full text-left px-3 py-2 rounded-xl text-gray-500 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-800/50 text-sm flex items-center gap-2">
                <HiOutlineBell className="w-4 h-4" /> Notifications
              </button>
            </Card>
          </div>

          {/* Form details */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-base font-bold text-dark-800 dark:text-white mb-4 flex items-center gap-2">
                <HiOutlineUser className="w-5 h-5 text-primary-500" /> Edit Profile Details
              </h3>
              <form onSubmit={handleSubmit(handleUpdateProfile)} className="space-y-4">
                <Input
                  label="Display Name"
                  name="name"
                  register={register}
                  error={errors.name?.message}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    register={register}
                    error={errors.email?.message}
                  />
                  <Input
                    label="Phone Number"
                    name="phone"
                    register={register}
                    error={errors.phone?.message}
                  />
                </div>
                <Button type="submit" variant="primary" className="py-2.5 px-6">
                  Save Profile Settings
                </Button>
              </form>
            </Card>

            <Card className="p-6">
              <h3 className="text-base font-bold text-dark-800 dark:text-white mb-4 flex items-center gap-2">
                <HiOutlineKey className="w-5 h-5 text-primary-500" /> Reset Password
              </h3>
              <form onSubmit={handleSubmit(handleUpdatePassword)} className="space-y-4">
                <Input
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  register={register}
                />
                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  register={register}
                />
                <Button type="submit" variant="primary" className="py-2.5 px-6">
                  Update Security Credentials
                </Button>
              </form>
            </Card>

            <Card className="p-6">
              <h3 className="text-base font-bold text-dark-800 dark:text-white mb-4 flex items-center gap-2">
                <HiOutlineCog className="w-5 h-5 text-primary-500" /> Theme Configuration
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-dark-800 dark:text-white">Dark Visual Preference</p>
                  <p className="text-xs text-gray-400">Configure dark styling theme for premium hotel backgrounds.</p>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                    isDark ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      isDark ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
