import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { HiOutlineSparkles, HiOutlineShieldCheck, HiOutlineUserGroup, HiOutlineClock } from 'react-icons/hi';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 } 
  },
};

const AboutPage = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const yHero = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const chefs = [
    { name: 'Chef Ranveer Brar', role: 'Executive Head Chef', image: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=800&q=80', description: 'With over 20 years of experience in royal kitchens, specializing in traditional North Indian slow-cooked delicacies.' },
    { name: 'Chef Anahita Dhondy', role: 'Pastry & Dessert Specialist', image: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?auto=format&fit=crop&w=800&q=80', description: 'Master of fusion desserts, blending classical Indian sweets with contemporary European pastry techniques.' },
    { name: 'Chef Vikas Khanna', role: 'Culinary Consultant', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80', description: 'Renowned expert in spice mapping, crafting our curated signature dishes and traditional beverage program.' }
  ];

  const values = [
    { icon: HiOutlineSparkles, title: 'Authenticity First', description: 'We source pure, traditional spices directly from geographical origins in India to ensure authentic flavors.' },
    { icon: HiOutlineShieldCheck, title: 'Uncompromising Quality', description: 'All ingredients are audited daily, and our kitchen meets the highest global safety and sanitization standards.' },
    { icon: HiOutlineUserGroup, title: 'Gourmet Hospitality', description: 'We treat every diner like royalty, ensuring a premium 5-star experience from screen ordering to table service.' },
    { icon: HiOutlineClock, title: 'Precision Preparation', description: 'Every order is tracked and timed to ensure hot dishes arrive exactly at their culinary peak.' }
  ];

  return (
    <div ref={containerRef} className="bg-gray-50 dark:bg-dark-950 min-h-screen font-sans text-gray-800 dark:text-gray-200 selection:bg-amber-500/30">
      {/* ─── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-dark-950">
        {/* Parallax Background */}
        <motion.div 
          style={{ y: yHero, opacity: opacityHero }}
          className="absolute inset-0 w-full h-full -z-20 bg-dark-950"
        >
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            poster="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80"
            className="object-cover w-full h-full scale-105"
          >
            <source src="https://cdn.pixabay.com/video/2021/08/04/83864-584742634_large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-dark-950/80 via-dark-950/60 to-dark-950" />
        </motion.div>

        {/* Ambient Floating Elements */}
        <motion.div 
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-4xl mx-auto">
              <motion.div variants={fadeInUp} custom={0} className="mb-6 inline-block">
              <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-dark-900/50 border border-white/20 text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-widest backdrop-blur-md shadow-2xl">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Our Legacy
              </span>
            </motion.div>
            <motion.h1 variants={fadeInUp} custom={1} className="text-4xl sm:text-6xl md:text-7xl font-bold font-display text-white mb-8 leading-tight tracking-tight drop-shadow-2xl">
              Where Tradition Meets <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 drop-shadow-lg">Technology</span>
            </motion.h1>
            <motion.p variants={fadeInUp} custom={2} className="text-base sm:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-xl">
              Founded in 2026, Rasoi Junction represents the pinnacle of modern Indian dining, combining centuries-old culinary heritage with seamless, state-of-the-art management.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ─── Our Story Section ────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true, margin: "-100px" }} 
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.h2 variants={fadeInUp} className="text-4xl sm:text-5xl font-bold text-dark-900 dark:text-white font-display leading-tight">
                A Culinary Journey <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Redefined</span>
              </motion.h2>
              <motion.div variants={fadeInUp} className="space-y-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-light">
                <p>
                  At Rasoi Junction, we believe dining is not just about eating; it is an immersive sensory celebration. Our journey started in royal kitchens where techniques were passed down through generations. Today, we bring those secret recipes to life in a breathtaking modern setting.
                </p>
                <p>
                  Every dish is crafted by our master culinary artisans using traditional clay ovens (tandoor) and slow-cooking (dum) methodologies. Our platform ensures that this premium quality remains uncompromised, tracking every temperature step until it reaches your table.
                </p>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200 dark:border-dark-800">
                <div className="group cursor-default">
                  <p className="text-3xl sm:text-4xl font-black text-dark-900 dark:text-white group-hover:text-amber-500 transition-colors">100%</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-2 uppercase font-bold tracking-widest">Natural Spices</p>
                </div>
                <div className="border-l border-gray-200 dark:border-dark-800 pl-6 group cursor-default">
                  <p className="text-3xl sm:text-4xl font-black text-dark-900 dark:text-white group-hover:text-amber-500 transition-colors">5-Star</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-2 uppercase font-bold tracking-widest">Hygiene Audit</p>
                </div>
                <div className="border-l border-gray-200 dark:border-dark-800 pl-6 group cursor-default">
                  <p className="text-3xl sm:text-4xl font-black text-dark-900 dark:text-white group-hover:text-amber-500 transition-colors">60+</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-2 uppercase font-bold tracking-widest">Curated Dishes</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }} 
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }} 
              viewport={{ once: true, margin: "-100px" }} 
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} 
              className="relative lg:ml-auto w-full max-w-lg mx-auto"
            >
              {/* Decorative background blocks */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-[2.5rem] opacity-20 blur-2xl transform rotate-3 scale-105 animate-pulse-slow" />
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-[2rem] transform rotate-3 opacity-20" />
              
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-dark-950/50 border border-white/10 dark:border-white/5 aspect-[4/5] group">
                <img 
                  src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80" 
                  alt="Culinary prep" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent opacity-60" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Core Values ──────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 relative overflow-hidden bg-white dark:bg-dark-900 border-y border-gray-100 dark:border-dark-800">
        <div className="absolute inset-0 bg-mesh opacity-5 dark:opacity-20 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl sm:text-5xl font-bold font-display text-dark-900 dark:text-white mb-6">
              Our Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Values</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-light">
              The unwavering pillars that define our commitment to culinary excellence and technological innovation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {values.map((val, i) => (
              <motion.div 
                key={val.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group bg-gray-50 dark:bg-dark-800/50 backdrop-blur-sm p-8 sm:p-10 rounded-[2rem] border border-gray-200 dark:border-white/5 hover:border-amber-500/30 dark:hover:border-amber-500/30 shadow-sm hover:shadow-2xl hover:shadow-amber-500/10 transition-all text-center relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px] transform translate-x-1/2 -translate-y-1/2 group-hover:bg-amber-500/20 transition-colors" />
                
                <div className="w-16 h-16 bg-white dark:bg-dark-700 shadow-lg rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-500 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <val.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-4 group-hover:text-amber-500 transition-colors">{val.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light">{val.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Meet the Chefs ───────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-dark-900 dark:text-white mb-6">
            Our Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Chefs</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-light">
            Crafting delicious stories everyday with decades of combined passion and experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
          {chefs.map((chef, i) => (
            <motion.div 
              key={chef.name}
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="group relative rounded-[2.5rem] bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-500"
            >
              <div className="h-80 sm:h-96 overflow-hidden relative">
                <img 
                  src={chef.image} 
                  alt={chef.name} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute bottom-0 left-0 w-full p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h4 className="font-display font-bold text-2xl sm:text-3xl text-white mb-2">{chef.name}</h4>
                  <p className="text-sm text-amber-400 font-semibold tracking-wider uppercase">{chef.role}</p>
                </div>
              </div>
              <div className="p-8 bg-white dark:bg-dark-800 relative z-10">
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed font-light">"{chef.description}"</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
