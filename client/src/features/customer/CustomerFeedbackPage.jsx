import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineChatAlt2, HiOutlineMail, HiOutlineClipboardList, HiOutlineReply } from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';

const CustomerFeedbackPage = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  const fetchMyFeedbacks = async () => {
    try {
      const res = await api.get('/feedbacks/mine');
      setFeedbacks(res.feedbacks || []);
    } catch (err) {
      console.error('Failed to load feedbacks:', err);
    }
  };

  const fetchMyContacts = async () => {
    try {
      const res = await api.get('/contacts/mine');
      setContacts(res.contacts || []);
    } catch (err) {
      console.error('Failed to load contact messages:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyFeedbacks();
      fetchMyContacts();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/feedbacks', {
        subject: subject.trim(),
        message: message.trim(),
        email: email.trim(),
      });
      setSubject('');
      setMessage('');
      toast.success('Feedback submitted! A confirmation email has been sent to your inbox.');
      fetchMyFeedbacks();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-dark-800 dark:text-white">Customer Service Feedback</h1>
          <p className="text-sm text-gray-500 dark:text-dark-400">Submit your queries, issues or suggestions directly to our restaurant manager.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Submit Form */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-base font-bold text-dark-800 dark:text-white mb-4 flex items-center gap-2">
                <HiOutlineChatAlt2 className="w-5 h-5 text-primary-500" /> Write to Us
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Reply-to Email</label>
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">A confirmation email will be sent here. You may change it.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Delivery delay, Food Quality"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Message Detail</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your issue or feedback in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
                <Button type="submit" variant="primary" loading={loading} className="w-full">
                  Submit Feedback
                </Button>
              </form>
            </Card>
          </div>

          {/* Feedback & Inquiries History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Feedback History */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-dark-800 dark:text-white mb-2 flex items-center gap-2">
                <HiOutlineClipboardList className="w-5 h-5 text-primary-500" /> Feedback History
              </h3>

              {feedbacks.length === 0 ? (
                <Card className="p-8 text-center text-xs text-gray-500 dark:text-dark-400">
                  You have not submitted any feedback ticket yet.
                </Card>
              ) : (
                feedbacks.map((f) => (
                  <Card key={f._id || f.id} className="p-5 space-y-3 border-l-4 border-l-primary-500">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-dark-800 dark:text-white text-sm">{f.subject}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">Submitted on: {f.date || (f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '')}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-dark-300 leading-relaxed bg-gray-50 dark:bg-dark-900/50 p-3 rounded-lg">
                      {f.message}
                    </p>

                    {f.reply ? (
                      <div className="pl-4 border-l-2 border-l-green-500 space-y-1.5 pt-1">
                        <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider flex items-center gap-1">
                          <HiOutlineReply className="w-3.5 h-3.5 transform scale-x-[-1]" /> Manager's Reply
                        </p>
                        <p className="text-xs text-dark-700 dark:text-dark-200 bg-green-50/50 dark:bg-green-500/5 p-2.5 rounded-lg leading-relaxed">
                          {f.reply}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-400 italic">Waiting for management response...</p>
                    )}
                  </Card>
                ))
              )}
            </div>

            {/* Contact Inquiries History */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-dark-800 dark:text-white mb-2 flex items-center gap-2">
                <HiOutlineMail className="w-5 h-5 text-primary-500" /> Public Contact Inquiries
              </h3>

              {contacts.length === 0 ? (
                <Card className="p-8 text-center text-xs text-gray-500 dark:text-dark-400">
                  You have not submitted any public contact form inquiry yet.
                </Card>
              ) : (
                contacts.map((c) => (
                  <Card key={c._id || c.id} className="p-5 space-y-3 border-l-4 border-l-amber-500">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-dark-800 dark:text-white text-sm">{c.subject}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">Submitted on: {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-dark-300 leading-relaxed bg-gray-50 dark:bg-dark-900/50 p-3 rounded-lg">
                      {c.message}
                    </p>

                    {c.reply ? (
                      <div className="pl-4 border-l-2 border-l-green-500 space-y-1.5 pt-1">
                        <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider flex items-center gap-1">
                          <HiOutlineReply className="w-3.5 h-3.5 transform scale-x-[-1]" /> Support Team Reply
                        </p>
                        <p className="text-xs text-dark-700 dark:text-dark-200 bg-green-50/50 dark:bg-green-500/5 p-2.5 rounded-lg leading-relaxed">
                          {c.reply}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-400 italic">Waiting for support response...</p>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerFeedbackPage;
