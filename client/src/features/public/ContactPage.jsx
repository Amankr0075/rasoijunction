import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineClock } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ContactPage = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      await api.post('/contacts', data);
      toast.success('Your message has been sent successfully! We will get back to you shortly. ✉️');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const contactInfos = [
    { icon: HiOutlinePhone, title: 'Call Us Directly', detail: '1234567890', subtitle: 'Support: 11:00 AM - 11:00 PM' },
    { icon: HiOutlineMail, title: 'Email Inquiries', detail: 'rasoijunction.admin@gmail.com', subtitle: 'Response time: Within 2 hours' },
    { icon: HiOutlineLocationMarker, title: 'Our Location', detail: 'Parul University', subtitle: 'Vadodara, Gujarat, 391760' },
    { icon: HiOutlineClock, title: 'Operating Hours', detail: 'Everyday: 11:00 AM - 11:00 PM', subtitle: 'Dine-In, Delivery & Takeaway' }
  ];

  return (
    <div className="bg-gray-50 dark:bg-dark-950 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 text-xs font-semibold uppercase tracking-wider mb-3"
          >
            Get In Touch
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold font-display text-dark-800 dark:text-white"
          >
            We'd Love to Hear From <span className="text-gradient">You</span>
          </motion.h1>
          <p className="text-gray-500 dark:text-dark-400 mt-2 max-w-md mx-auto text-sm">
            Have questions about group bookings, corporate events, or our menu items? Reach out to us.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-16">
          {/* Contact Details Cards */}
          <div className="lg:col-span-1 space-y-6">
            {contactInfos.map((info, idx) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <Card className="p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-500 flex-shrink-0">
                    <info.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-dark-800 dark:text-white text-sm">{info.title}</h3>
                    <p className="text-sm text-primary-500 font-bold mt-1">{info.detail}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{info.subtitle}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h2 className="text-xl font-bold text-dark-800 dark:text-white mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    label="Full Name *"
                    name="name"
                    placeholder="Enter your name"
                    register={register}
                    required
                    error={errors.name?.message}
                  />
                  <Input
                    label="Email Address *"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    register={register}
                    required
                    error={errors.email?.message}
                  />
                </div>

                <Input
                  label="Subject *"
                  name="subject"
                  placeholder="E.g. Table Reservation Inquiry, Event Catering..."
                  register={register}
                  required
                  error={errors.subject?.message}
                />

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-200">
                    Your Message *
                  </label>
                  <textarea
                    {...register('message', { required: 'Message body is required' })}
                    placeholder="Tell us what you need help with..."
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-sm text-dark-800 dark:text-dark-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                  {errors.message && <p className="text-sm text-danger-500 mt-1">{errors.message.message}</p>}
                </div>

                <Button type="submit" variant="primary" className="py-3 px-8 text-sm" loading={submitLoading}>
                  Send Message
                </Button>
              </form>
            </Card>
          </div>
        </div>

        {/* Maps Placeholder */}
        <div className="rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-dark-800 h-96 relative">
          <div 
            className="absolute inset-0 bg-cover bg-center flex items-center justify-center text-center p-6"
            style={{ backgroundImage: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.85)), url(/hotel_bg.png)' }}
          >
            <div className="max-w-md">
              <HiOutlineLocationMarker className="w-12 h-12 text-primary-500 mx-auto mb-4 animate-bounce" />
              <h3 className="text-xl font-bold text-white mb-2">Visit Rasoi Junction</h3>
              <p className="text-gray-300 text-sm mb-4">Parul University, Vadodara, Gujarat, 391760</p>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-semibold">
                Dine-In • Parking Available • Free Valet
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
