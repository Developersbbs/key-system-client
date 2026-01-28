import React, { useState, useEffect } from "react";
import {
  Shield,
  BookOpen,
  Award,
  Check,
  Calendar,
  ArrowRight,
  Star,
  Phone,
  ShoppingCart,
  ShieldCheck,
  Gift,
  Play,
  MapPin,
  Mail,
  Users,
  TrendingUp,
  BarChart3,
  Target,
  Clock,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  Globe,
  PieChart,
  Lightbulb,
  Twitter,
  Facebook,
  Linkedin,
  Instagram,
  Video,
  Headphones,
  ChevronDown,
  Plus,
  X as CloseX
} from "lucide-react";
import { FileText } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Link } from "react-router-dom";
import logo from '../assets/key-system-logo.png';

// FAQ Accordion Component
const FAQAccordion = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is included in the $10/year plan?",
      answer: "You get complete access to 20+ cryptocurrency courses, interactive learning simulator, live workshops and events, community forum access, priority chat support, progress certificates, expert mentorship sessions, lifetime course updates, and mobile app access. Everything you need to master crypto!"
    },
    {
      question: "Do I need any prior experience with cryptocurrency?",
      answer: "Not at all! Our courses are designed for everyone from complete beginners to advanced traders. We start with the fundamentals and gradually progress to advanced strategies. Our learning path is structured to match your current level of expertise."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes! There's no long-term commitment. You can cancel your subscription with just one click, anytime you want. No questions asked, no cancellation fees."
    },
    {
      question: "How do the live workshops and mentorship sessions work?",
      answer: "Live workshops are scheduled regularly throughout the month and cover trending topics in crypto. Mentorship sessions can be booked directly through your dashboard where you can connect with expert instructors one-on-one to discuss your learning goals and get personalized guidance."
    },
    {
      question: "Are the certificates recognized by employers?",
      answer: "Our completion certificates demonstrate your knowledge and commitment to learning cryptocurrency. While they're not accredited certifications, they're valuable for showcasing your skills on LinkedIn, resumes, and portfolios. Many of our students have successfully transitioned into crypto-related careers."
    },
    {
      question: "What devices can I use to access the platform?",
      answer: "You can access our platform on any device - desktop, laptop, tablet, or smartphone. All your progress syncs automatically across all devices."
    },
    {
      question: "How often is the course content updated?",
      answer: "We update our course content regularly to reflect the latest trends, regulations, and technologies in the cryptocurrency space. You'll receive lifetime updates as part of your subscription, ensuring you always have access to current and relevant information."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl border-2 border-gray-200 hover:border-emerald-400 hover:shadow-lg transition-all duration-300 overflow-hidden"
        >
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-emerald-50/50 transition-all duration-200 group"
          >
            <span className="font-bold text-gray-900 text-base sm:text-lg pr-4 group-hover:text-emerald-700 transition-colors duration-200">
              {faq.question}
            </span>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openIndex === index
              ? 'bg-emerald-500 rotate-45 scale-110'
              : 'bg-emerald-100 group-hover:bg-emerald-200'
              }`}>
              <Plus
                className={`transition-all duration-300 ${openIndex === index ? 'text-white' : 'text-emerald-600'
                  }`}
                size={20}
              />
            </div>
          </button>
          <div
            className={`px-6 overflow-hidden transition-all duration-500 ease-in-out ${openIndex === index ? 'max-h-96 pb-5 pt-2' : 'max-h-0'
              }`}
          >
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {faq.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const Home = () => {
  const [counters] = useState({
    lessons: 250,
    languages: 8,
    rating: 4.8,
  });

  // Updated slider images with white/green professional theme
  const sliderImages = [
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1400&q=80", // Clean white office with greenery
    "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1400&q=80", // Modern laptop workspace
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80", // Analytics dashboard
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1400&q=80"  // Trading charts
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [formMessage, setFormMessage] = useState('');

  // Auto slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === sliderImages.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === sliderImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? sliderImages.length - 1 : prev - 1));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    setFormMessage("Thank you for your message! We'll get back to you soon.");
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="w-full h-full bg-white">
      {/* Hero Section with Mobile Height Adjustment */}
      <section
        id="home"
        className="relative w-full h-[70vh] md:h-screen flex items-center justify-center text-center px-4 sm:px-6 md:px-8 lg:px-16 xl:px-20 overflow-hidden"
      >
        {/* Enhanced Slider Background */}
        <div className="absolute inset-0 h-full">
          {sliderImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 h-full transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-150 scale-100' : 'opacity-0 scale-105'
                }`}
            >
              <img
                src={image}
                alt={`Professional workspace ${index + 1}`}
                className="w-full h-full object-cover brightness-50"
              />
              <div className="absolute inset-0 bg-black/15"></div>
            </div>
          ))}
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-teal-300 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-green-300 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Enhanced Slider Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-2 md:left-4 z-20 p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 md:right-4 z-20 p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Enhanced Slider Indicators */}
        <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2 md:space-x-3">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 ${index === currentSlide
                ? 'w-6 md:w-8 h-2 md:h-3 bg-emerald-400 rounded-full'
                : 'w-2 h-2 md:w-3 md:h-3 bg-white/50 rounded-full hover:bg-white/70'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>

        {/* Enhanced Content with Mobile Optimization */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 w-full">
          <div className="mb-3 md:mb-6 inline-flex items-center px-2 py-1 md:px-4 md:py-2 bg-emerald-500/20 backdrop-blur-md rounded-full border border-emerald-400/30">
            <Zap className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-emerald-300" />
            <span className="text-xs md:text-sm font-medium text-emerald-200">India's #1 Crypto Education Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight mb-3 md:mb-6 text-white">
            Master Crypto Knowledge from
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 mt-1 md:mt-3 animate-pulse">
              Zero to Pro
            </span>
          </h1>

          <p className="mt-3 md:mt-6 text-sm sm:text-base md:text-xl max-w-2xl mx-auto leading-relaxed text-gray-100">
            Join <span className="font-bold text-emerald-300">10,000+</span> learners who gained comprehensive crypto knowledge through our expert-led courses, interactive lessons, and proven learning methods.
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="mt-6 md:mt-10 flex flex-col sm:flex-row justify-center gap-2 md:gap-4">
            <Link to="/register" className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 text-white px-5 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold text-sm md:text-lg hover:from-emerald-600 hover:via-teal-600 hover:to-green-600 transform hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-300 shadow-lg md:shadow-xl hover:shadow-emerald-500/25">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center">
                Start Learning for Free
                <ArrowRight className="ml-2 md:ml-3 h-4 w-4 md:h-6 md:w-6 group-hover:translate-x-1 md:group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </Link>

            <a href="#courses" className="group relative overflow-hidden border-2 border-white/40 backdrop-blur-md text-white px-5 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold text-sm md:text-lg hover:bg-white hover:text-emerald-600 transform hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-300 shadow-lg md:shadow-xl">
              <div className="relative flex items-center justify-center">
                <Play className="mr-2 md:mr-3 h-4 w-4 md:h-6 md:w-6 group-hover:scale-110 transition-transform duration-300" />
                Watch Demo
              </div>
            </a>
          </div>

          {/* Enhanced Feature Pills */}
          <div className="mt-4 md:mt-8 flex flex-wrap justify-center gap-2 md:gap-3">
            <div className="flex items-center bg-white/10 backdrop-blur-md px-2 py-1 md:px-4 md:py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300">
              <ShieldCheck className="h-3 w-3 md:h-5 md:w-5 mr-1 md:mr-2 text-emerald-300" />
              <span className="text-xs md:text-sm text-gray-300 font-medium">100% Safe & Secure</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-md px-2 py-1 md:px-4 md:py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300">
              <BookOpen className="h-3 w-3 md:h-5 md:w-5 mr-1 md:mr-2 text-teal-300" />
              <span className="text-xs md:text-sm font-medium text-gray-300">250+ Free Lessons</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-md px-2 py-1 md:px-4 md:py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300">
              <Award className="h-3 w-3 md:h-5 md:w-5 mr-1 md:mr-2 text-green-300" />
              <span className="text-xs md:text-sm font-medium text-gray-300">Certified Courses</span>
            </div>
          </div>
        </div>
      </section>


      {/* Enhanced Courses Section */}
      <section id="courses" className="py-24 bg-gradient-to-br from-gray-50 via-white to-emerald-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-600 rounded-full font-medium text-sm mb-6">
              <BookOpen className="w-4 h-4 mr-2" />
              Our Courses
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Explore Our
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600">
                Crypto Learning Paths
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Dive deep into the world of cryptocurrency with our expertly crafted courses, designed for all skill levels.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Course Card 1 - Beginner */}
            <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1620336655052-b57986f5a26a?auto=format&fit=crop&w=800&q=80"
                  alt="Crypto Fundamentals Course"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-emerald-600 bg-emerald-100 rounded-full">Beginner</span>
                  </div>
                  <div className="flex items-center text-amber-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="ml-1 text-gray-600 text-sm">4.9</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300">Crypto Fundamentals</h3>
                <p className="text-gray-600 text-sm mb-6">Understand blockchain, wallets, and the core concepts of digital currencies.</p>
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>12 Lessons</span>
                  <Users className="w-4 h-4 ml-4 mr-2" />
                  <span>5.2K Students</span>
                </div>
                <div className="flex justify-center items-center">
                  <Link to="/register?course=crypto-fundamentals" className="relative overflow-hidden w-full bg-gradient-to-b from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-0.5 active:translate-y-0">
                    <span className="relative z-10 flex items-center">
                      Enroll Now
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-emerald-700/20 to-transparent rounded-xl"></div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Course Card 2 - Intermediate */}
            <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
                  alt="Technical Analysis Course"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">Intermediate</span>
                  </div>
                  <div className="flex items-center text-amber-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="ml-1 text-gray-600 text-sm">4.8</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300">Technical Analysis Masterclass</h3>
                <p className="text-gray-600 text-sm mb-6">Master chart reading, technical patterns, and analysis fundamentals.</p>
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>20 Lessons</span>
                  <Users className="w-4 h-4 ml-4 mr-2" />
                  <span>3.8K Students</span>
                </div>
                <div className="flex justify-center items-center">
                  <Link to="/register?course=technical-analysis" className="relative overflow-hidden w-full bg-gradient-to-b from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-0.5 active:translate-y-0">
                    <span className="relative z-10 flex items-center">
                      Enroll Now
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-emerald-700/20 to-transparent rounded-xl"></div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Course Card 3 - Advanced */}
            <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1624555130581-1d9cca783bc0?auto=format&fit=crop&w=800&q=80"
                  alt="Advanced DeFi & NFTs Course"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-600 bg-purple-100 rounded-full">Advanced</span>
                  </div>
                  <div className="flex items-center text-amber-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="ml-1 text-gray-600 text-sm">4.9</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300">DeFi, NFTs & Web3 Frontier</h3>
                <p className="text-gray-600 text-sm mb-6">Explore decentralized finance, NFTs, and the future of the internet.</p>
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>18 Lessons</span>
                  <Users className="w-4 h-4 ml-4 mr-2" />
                  <span>1.5K Students</span>
                </div>
                <div className="flex justify-center items-center">
                  <Link to="/register?course=defi-nft" className="relative overflow-hidden bg-gradient-to-b w-full from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-0.5 active:translate-y-0">
                    <span className="relative z-10 flex items-center">
                      Enroll Now
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-emerald-700/20 to-transparent rounded-xl"></div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Browse All Courses Button */}
          <div className="text-center mt-16">
            <Link
              to="/register?next=courses"
              className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-600 hover:via-teal-600 hover:to-green-600 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 inline-flex items-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Browse All Courses
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Link>
          </div>
        </div>
      </section >

      {/* Enhanced Key Features Section */}
      < section id="features" className="py-24 bg-gradient-to-br from-gray-50 via-white to-emerald-50" >
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-600 rounded-full font-medium text-sm mb-6">
              <Lightbulb className="w-4 h-4 mr-2" />
              Why Choose Key Kissan
            </div>
            <h2 className=" text-xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Everything You Need to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600">
                Succeed in Crypto
              </span>
            </h2>


            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our comprehensive platform provides cutting-edge tools and expert guidance to transform beginners into confident crypto enthusiasts.
            </p>
          </div>
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {/* Enhanced Feature Cards */}
            <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-2 hover:border-emerald-200">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
              <div className="relative">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-4 group-hover:text-emerald-600 transition-colors duration-300">
                  Structured Learning Paths
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Master crypto step-by-step with our carefully designed progressive courses. No confusion, maximum clarity.
                </p>
              </div>
            </div>
            <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-2 hover:border-blue-200">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
              <div className="relative">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FileText className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  Interactive Assessments
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Test your knowledge with engaging quizzes and real-time feedback. Track progress with detailed analytics.
                </p>
              </div>
            </div>
            <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-2 hover:border-purple-200">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
              <div className="relative">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                  Interactive Learning Tools
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Practice with interactive simulations and hands-on exercises. Build confidence in a safe learning environment.
                </p>
              </div>
            </div>
            <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-2 hover:border-green-200">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
              <div className="relative">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-4 group-hover:text-green-600 transition-colors duration-300">
                  Expert Community
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Join live sessions, webinars, and discussions. Learn from industry experts and successful peers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Enhanced Stats Section */}
      < section className="py-12 md:py-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 relative overflow-hidden" >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-48 h-48 md:w-72 md:h-72 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 md:w-72 md:h-72 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-center text-white">

            {/* Happy Students */}
            <div className="group p-4 md:p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.03]">
              <div className="flex justify-center mb-3">
                <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors duration-300">
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-black mb-1">10K+</div>
              <div className="text-xs md:text-sm opacity-90 group-hover:opacity-100 transition-opacity duration-300">Happy Students</div>
            </div>

            {/* Video Lessons */}
            <div className="group p-4 md:p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.03]">
              <div className="flex justify-center mb-3">
                <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors duration-300">
                  <Video className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-black mb-1">250+</div>
              <div className="text-xs md:text-sm opacity-90 group-hover:opacity-100 transition-opacity duration-300">Video Lessons</div>
            </div>

            {/* Success Rate */}
            <div className="group p-4 md:p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.03]">
              <div className="flex justify-center mb-3">
                <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors duration-300">
                  <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-black mb-1">98%</div>
              <div className="text-xs md:text-sm opacity-90 group-hover:opacity-100 transition-opacity duration-300">Success Rate</div>
            </div>

            {/* Support */}
            <div className="group p-4 md:p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.03]">
              <div className="flex justify-center mb-3">
                <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors duration-300">
                  <Headphones className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-black mb-1">24/7</div>
              <div className="text-xs md:text-sm opacity-90 group-hover:opacity-100 transition-opacity duration-300">Support</div>
            </div>

          </div>
        </div>
      </section >

      {/* Enhanced Learning Path Section */}
      < section className="py-24 bg-white" >
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-600 rounded-full font-medium text-sm mb-6">
              <Target className="w-4 h-4 mr-2" />
              Learning Journey
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Your Path to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-teal-600 to-emerald-600">
                Crypto Mastery
              </span>
            </h2>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Follow our proven 4-stage journey from complete beginner to confident crypto expert.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-20 left-1/2 transform -translate-x-1/2 w-full h-0.5 bg-gradient-to-r from-emerald-200 via-blue-200 to-purple-200"></div>
            {/* Step Cards */}
            {[
              { step: 1, title: "Foundation", subtitle: "Beginner", icon: BookOpen, color: "emerald", desc: "Master crypto basics, blockchain fundamentals, and essential market terminology." },
              { step: 2, title: "Application", subtitle: "Intermediate", icon: TrendingUp, color: "blue", desc: "Learn market analysis, technical fundamentals, and crypto ecosystem understanding." },
              { step: 3, title: "Mastery", subtitle: "Advanced", icon: Award, color: "purple", desc: "Explore DeFi, advanced concepts, and comprehensive blockchain technology." },
              { step: 4, title: "Community", subtitle: "Expert", icon: Users, color: "green", desc: "Join our network, participate in exclusive events, and mentor newcomers." }
            ].map((item, index) => (
              <div key={index} className="relative group">
                <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10 group-hover:scale-110 transition-transform duration-300`}>
                  {item.step}
                </div>
                <div className="bg-gray-50 p-8 rounded-3xl text-center hover:shadow-xl transition-all duration-300 pt-12 group-hover:-translate-y-2">
                  <div className={`w-16 h-16 mx-auto bg-gradient-to-br from-${item.color}-100 to-${item.color}-200 flex items-center justify-center rounded-2xl shadow-md mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`text-${item.color}-600`} size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <div className={`text-sm font-medium text-${item.color}-600 mb-4`}>({item.subtitle})</div>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* Enhanced User-Friendly Pricing Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-semibold text-sm mb-6 shadow-sm">
              <Zap className="w-4 h-4 mr-2" />
              Simple & Affordable Pricing
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Start Your Crypto Journey
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 mt-2">
                For Just $10/Year
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              No hidden fees. No complicated tiers. Just complete access to everything you need to master cryptocurrency.
            </p>
          </div>

          {/* Value Highlights - 3 Key Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-emerald-100 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="text-white" size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">20+ Courses</h4>
              <p className="text-sm text-gray-600">Complete library from beginner to advanced</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-emerald-100 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-4">
                <Users className="text-white" size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Expert Support</h4>
              <p className="text-sm text-gray-600">Priority chat & mentorship sessions</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-emerald-100 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <Award className="text-white" size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Certificates</h4>
              <p className="text-sm text-gray-600">Earn verifiable completion certificates</p>
            </div>
          </div>

          {/* Main Pricing Card - Landscape Optimized */}
          <div className="flex justify-center pt-6">
            <div className="w-full max-w-5xl">
              <div className="group relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-emerald-500">
                {/* Best Value Badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-2 rounded-full text-sm font-bold shadow-lg z-10 animate-pulse">
                  🎉 BEST VALUE
                </div>

                {/* Card Content - Grid for Landscape */}
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Left Side - Pricing */}
                  <div className="p-5 sm:p-6 lg:p-8 text-center lg:border-r border-gray-100 rounded-tl-3xl lg:rounded-bl-3xl rounded-tr-3xl lg:rounded-tr-none">
                    {/* Icon */}
                    <div className="w-16 h-16 lg:w-14 lg:h-14 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center rounded-2xl shadow-lg mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <BookOpen className="text-white" size={28} />
                    </div>

                    {/* Plan Name */}
                    <h3 className="text-2xl sm:text-3xl lg:text-3xl font-black text-gray-900 mb-2">Complete Access Plan</h3>

                    {/* Price */}
                    <div className="mb-3">
                      <div className="flex justify-center items-baseline">
                        <span className="text-5xl sm:text-6xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">$10</span>
                        <span className="text-2xl text-gray-500 ml-2">/year</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">That's just $0.03 per day!</p>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 text-sm lg:text-base">
                      Unlock your crypto potential with unlimited access to all learning resources
                    </p>

                    {/* CTA Button */}
                    <Link
                      to="/register?plan=basic"
                      className="inline-flex items-center justify-center w-full lg:w-auto bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 text-white py-3 px-6 rounded-xl font-bold text-base hover:from-emerald-600 hover:via-teal-600 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 group"
                    >
                      Start Learning Now
                      <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>

                    {/* Trust Badge */}
                    <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-gray-600">
                      <ShieldCheck className="text-emerald-500" size={18} />
                      <span>30-Day Money-Back Guarantee</span>
                    </div>
                  </div>

                  {/* Right Side - Features */}
                  <div className="bg-gradient-to-b from-gray-50 to-white p-5 sm:p-6 lg:p-8 rounded-tr-none lg:rounded-tr-3xl rounded-br-3xl flex flex-col h-full">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 text-center lg:text-left">Everything Included:</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 sm:gap-y-6 gap-x-2 sm:gap-x-3 flex-1 content-around">
                      {[
                        { icon: BookOpen, text: "20+ Courses" },
                        { icon: Video, text: "Simulator" },
                        { icon: Calendar, text: "Workshops" },
                        { icon: Users, text: "Community" },
                        { icon: Headphones, text: "Support" },
                        { icon: Award, text: "Certificates" },
                        { icon: Users, text: "Mentorship" },
                        { icon: Zap, text: "Updates" },
                        { icon: Globe, text: "Mobile App" }
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-emerald-50 transition-colors duration-200">
                          <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                            <feature.icon className="text-emerald-600" size={14} />
                          </div>
                          <span className="text-gray-700 font-medium text-xs sm:text-sm">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Trust Indicators */}
                <div className="bg-emerald-50 px-4 py-2 sm:py-3 border-t border-emerald-100 rounded-b-3xl">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs">
                    <div className="flex items-center text-gray-700">
                      <Users className="text-emerald-600 mr-1.5" size={16} />
                      <span className="font-semibold">10,000+ Students</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Star className="text-yellow-500 fill-current mr-1.5" size={16} />
                      <span className="font-semibold">4.9/5 Rating</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <ShieldCheck className="text-emerald-600 mr-1.5" size={16} />
                      <span className="font-semibold">Secure Payment</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: How It Works - Enhanced Learning Journey */}
          <div className="relative py-24 bg-gradient-to-b from-gray-50 via-white to-emerald-50/30 overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-200/15 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
              {/* Header */}
              <div className="text-center mb-20">
                <div className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-700 rounded-full font-bold text-sm mb-6 shadow-lg border border-teal-200">
                  <Target className="w-5 h-5 mr-2 animate-pulse" />
                  <span className="bg-gradient-to-r from-teal-700 to-emerald-700 bg-clip-text text-transparent">Your Learning Journey</span>
                </div>
                <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
                  How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600">Works</span>
                </h2>
                <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Your path from <span className="font-bold text-emerald-600">beginner</span> to <span className="font-bold text-purple-600">crypto expert</span> in 4 simple steps
                </p>
                {/* Decorative Divider */}
                <div className="flex items-center justify-center mt-8 space-x-2">
                  <div className="h-1 w-16 bg-gradient-to-r from-transparent to-emerald-500 rounded-full"></div>
                  <div className="h-1 w-1 bg-emerald-500 rounded-full"></div>
                  <div className="h-1 w-32 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                  <div className="h-1 w-1 bg-teal-500 rounded-full"></div>
                  <div className="h-1 w-16 bg-gradient-to-r from-teal-500 to-transparent rounded-full"></div>
                </div>
              </div>

              {/* Steps Grid */}
              <div className="relative max-w-6xl mx-auto">
                {/* Progress Line - Desktop Only */}
                <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-emerald-300 via-teal-300 via-blue-300 to-purple-300 rounded-full z-0" style={{ width: 'calc(100% - 8rem)', marginLeft: '4rem' }}></div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                  {/* Step 1 */}
                  <div className="relative group">
                    <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full">
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                      {/* Step Number Badge */}
                      <div className="absolute -top-5 -left-5 w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 z-10">
                        1
                      </div>

                      {/* Background Pattern */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100/50 to-transparent rounded-full -mr-16 -mt-16"></div>

                      <div className="relative z-10">
                        {/* Icon */}
                        <div className="w-18 h-18 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                          <Users className="text-white" size={36} />
                        </div>

                        {/* Duration Badge */}
                        <div className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold mb-3">
                          <Clock className="w-3 h-3 mr-1" />
                          5 min
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300">Choose Your Path</h3>
                        <p className="text-gray-600 leading-relaxed text-sm mb-4">
                          Sign up and take our skill assessment to get personalized course recommendations tailored to your level.
                        </p>

                        {/* Mini Features */}
                        <div className="space-y-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                            Skill assessment quiz
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                            Personalized roadmap
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Connector */}
                    <div className="hidden lg:flex absolute top-24 -right-8 items-center justify-center z-20">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        <ArrowRight className="text-emerald-500" size={28} />
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative group">
                    <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl border-2 border-teal-200 hover:border-teal-400 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                      <div className="absolute -top-5 -left-5 w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 z-10">
                        2
                      </div>

                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-100/50 to-transparent rounded-full -mr-16 -mt-16"></div>

                      <div className="relative z-10">
                        <div className="w-18 h-18 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                          <BookOpen className="text-white" size={36} />
                        </div>

                        <div className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold mb-3">
                          <Clock className="w-3 h-3 mr-1" />
                          Flexible
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-teal-600 transition-colors duration-300">Learn Interactively</h3>
                        <p className="text-gray-600 leading-relaxed text-sm mb-4">
                          Master 20+ courses from beginner to advanced. Practice with our live crypto simulator risk-free.
                        </p>

                        <div className="space-y-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-2"></div>
                            20+ video courses
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-2"></div>
                            Live trading simulator
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="hidden lg:flex absolute top-24 -right-8 items-center justify-center z-20">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                        <ArrowRight className="text-teal-500" size={28} />
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative group">
                    <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                      <div className="absolute -top-5 -left-5 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 z-10">
                        3
                      </div>

                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full -mr-16 -mt-16"></div>

                      <div className="relative z-10">
                        <div className="w-18 h-18 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                          <Calendar className="text-white" size={36} />
                        </div>

                        <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-3">
                          <Clock className="w-3 h-3 mr-1" />
                          Weekly
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">Join Live Sessions</h3>
                        <p className="text-gray-600 leading-relaxed text-sm mb-4">
                          Attend weekly workshops with expert instructors. Get mentorship and ask your burning questions.
                        </p>

                        <div className="space-y-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                            Expert Q&A sessions
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                            1-on-1 mentorship
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="hidden lg:flex absolute top-24 -right-8 items-center justify-center z-20">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <ArrowRight className="text-blue-500" size={28} />
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative group">
                    <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                      <div className="absolute -top-5 -left-5 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 z-10">
                        4
                      </div>

                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/50 to-transparent rounded-full -mr-16 -mt-16"></div>

                      <div className="relative z-10">
                        <div className="w-18 h-18 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                          <Award className="text-white" size={36} />
                        </div>

                        <div className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold mb-3">
                          <Clock className="w-3 h-3 mr-1" />
                          Ongoing
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">Earn & Master</h3>
                        <p className="text-gray-600 leading-relaxed text-sm mb-4">
                          Complete courses and earn certificates. Join our community of 10,000+ successful crypto learners.
                        </p>

                        <div className="space-y-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                            Verified certificates
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                            Community access
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="text-center mt-16">
                <p className="text-gray-600 mb-6 text-lg">
                  Ready to start your journey?
                </p>
                <Link
                  to="/register?plan=basic"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg rounded-full hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" size={20} />
                </Link>
              </div>
            </div>
          </div>

          {/* Section 2: Platform Features Showcase */}
          <div className="py-20 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-semibold text-sm mb-4">
                  <Zap className="w-4 h-4 mr-2" />
                  Platform Features
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-4">
                  Everything You Need
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600">
                    To Master Crypto
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Powerful tools and resources designed to accelerate your learning journey
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Feature 1: Interactive Simulator */}
                <div className="group bg-white p-8 rounded-3xl border-2 border-gray-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <BarChart3 className="text-emerald-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">Interactive Simulator</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Practice trading with our risk-free simulator using real-time market data. Perfect your strategy before investing real money.
                  </p>
                </div>

                {/* Feature 2: Live Expert Workshops */}
                <div className="group bg-white p-8 rounded-3xl border-2 border-gray-200 hover:border-teal-400 hover:shadow-2xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Video className="text-teal-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">Live Expert Workshops</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Join weekly live sessions with industry professionals. Ask questions, network, and stay updated on crypto trends.
                  </p>
                </div>

                {/* Feature 3: Progress Certificates */}
                <div className="group bg-white p-8 rounded-3xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Award className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">Progress Certificates</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Earn verifiable completion certificates to showcase your crypto expertise on LinkedIn and your professional portfolio.
                  </p>
                </div>

                {/* Feature 4: Mobile Learning */}
                <div className="group bg-white p-8 rounded-3xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-2xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Globe className="text-purple-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">Mobile Learning</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Learn anywhere, anytime with our mobile apps for iOS and Android. All progress syncs automatically across devices.
                  </p>
                </div>

                {/* Feature 5: Community Forum */}
                <div className="group bg-white p-8 rounded-3xl border-2 border-gray-200 hover:border-green-400 hover:shadow-2xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Users className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">Community Forum</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Connect with 10,000+ crypto learners worldwide. Share strategies, tips, and learn from each other's experiences.
                  </p>
                </div>

                {/* Feature 6: 24/7 Support */}
                <div className="group bg-white p-8 rounded-3xl border-2 border-gray-200 hover:border-yellow-400 hover:shadow-2xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Headphones className="text-yellow-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">24/7 Support</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Get priority chat assistance whenever you need it. Our expert support team is always ready to help you succeed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced FAQ Section with Accordion */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold text-sm mb-4">
                <HelpCircle className="w-4 h-4 mr-2" />
                Frequently Asked Questions
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
                Got Questions?
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  We've Got Answers
                </span>
              </h3>
              <p className="text-gray-600 text-base">
                Everything you need to know about our crypto learning platform
              </p>
            </div>

            <FAQAccordion />

            {/* Additional Info Below FAQ */}
            <div className="mt-12 text-center p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
              <p className="text-gray-700 mb-3">
                <strong className="text-gray-900">Still have questions?</strong> We're here to help!
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span className="flex items-center text-gray-600">
                  <Check className="text-emerald-500 mr-1.5" size={16} />
                  24/7 Support Available
                </span>
                <span className="flex items-center text-gray-600">
                  <Check className="text-emerald-500 mr-1.5" size={16} />
                  No Credit Card Required
                </span>
                <span className="flex items-center text-gray-600">
                  <Check className="text-emerald-500 mr-1.5" size={16} />
                  Cancel Anytime
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      < section className="py-16 md:py-24 bg-gradient-to-b from-white to-emerald-50/50 relative overflow-hidden" >
        {/* Background decorative elements */}
        < div className="absolute top-0 left-0 w-72 h-72 bg-emerald-200/20 rounded-full -translate-x-1/2 -translate-y-1/2" ></div >
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-200/20 rounded-full translate-x-1/3 translate-y-1/3"></div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 md:mb-16 ">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r rounded-full from-emerald-100 to-teal-100 text-emerald-700 border-2 font-medium text-sm mb-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <Star className="w-4 h-4 mr-2 fill-current text-yellow-500" />
              Student Success Stories
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Real Results from
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 mt-2">
                Real Students
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              See how our students transformed their financial future through Key Kissan's proven education system.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Swiper Component */}
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              spaceBetween={30}
              slidesPerView={1}
              loop={true}
              autoplay={{
                delay: 6000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              pagination={{
                clickable: true,
                el: '.testimonial-pagination',
                bulletClass: 'testimonial-bullet',
                bulletActiveClass: 'testimonial-bullet-active',
              }}
              navigation={{
                nextEl: '.testimonial-next',
                prevEl: '.testimonial-prev',
              }}
              breakpoints={{
                640: {
                  slidesPerView: 1,
                },
                1024: {
                  slidesPerView: 2,
                },
              }}
              className="testimonial-swiper group"
            >
              {/* Testimonial 1 */}
              <SwiperSlide>
                <div className="h-full bg-white p-6 md:p-8  shadow-lg hover:shadow-xl transition-all duration-500 border border-emerald-100/50 hover:border-emerald-200 group-hover:scale-[0.98] group-hover:opacity-90 hover:!scale-100 hover:!opacity-100">
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md">
                      <span className="drop-shadow">P</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900 text-lg">Priya Sharma</h4>
                      <p className="text-gray-600 text-sm">Software Engineer, Mumbai</p>
                      <div className="flex mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-4 -left-2 text-5xl text-emerald-100/80 leading-4">"</div>
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed relative z-10">
                      Key Kissan completely changed my approach to crypto. I went from knowing nothing about blockchain to confidently understanding crypto fundamentals and market dynamics!
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-emerald-100 flex items-center text-sm text-emerald-600 font-medium">
                    <TrendingUp className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Completed 15+ Courses in 6 months</span>
                  </div>
                </div>
              </SwiperSlide>

              {/* Testimonial 2 */}
              <SwiperSlide>
                <div className="h-full bg-white p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-blue-100/50 hover:border-blue-200 group-hover:scale-[0.98] group-hover:opacity-90 hover:!scale-100 hover:!opacity-100">
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md">
                      <span className="drop-shadow">R</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900 text-lg">Rahul Patel</h4>
                      <p className="text-gray-600 text-sm">Business Owner, Bangalore</p>
                      <div className="flex mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-4 -left-2 text-5xl text-blue-100/80 leading-4">"</div>
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed relative z-10">
                      The structured learning path and expert mentorship helped me understand crypto deeply. Now I confidently explain blockchain concepts and even teach my friends!
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-blue-100 flex items-center text-sm text-blue-600 font-medium">
                    <Award className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Completed Advanced Certification</span>
                  </div>
                </div>
              </SwiperSlide>

              {/* Testimonial 3 */}
              <SwiperSlide>
                <div className="h-full bg-white p-6 md:p-8  shadow-lg hover:shadow-xl transition-all duration-500 border border-rose-100/50 hover:border-rose-200 group-hover:scale-[0.98] group-hover:opacity-90 hover:!scale-100 hover:!opacity-100">
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md">
                      <span className="drop-shadow">A</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900 text-lg">Anita Reddy</h4>
                      <p className="text-gray-600 text-sm">Marketing Manager, Hyderabad</p>
                      <div className="flex mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-4 -left-2 text-5xl text-rose-100/80 leading-4">"</div>
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed relative z-10">
                      As a complete beginner, I was overwhelmed by crypto. Key Kissan's step-by-step approach made everything clear. I now have a solid investment strategy.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-rose-100 flex items-center text-sm text-rose-600 font-medium">
                    <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Risk-Free Learning Approach</span>
                  </div>
                </div>
              </SwiperSlide>

              {/* Testimonial 4 */}
              <SwiperSlide>
                <div className="h-full bg-white p-6 md:p-8  shadow-lg hover:shadow-xl transition-all duration-500 border border-amber-100/50 hover:border-amber-200 group-hover:scale-[0.98] group-hover:opacity-90 hover:!scale-100 hover:!opacity-100">
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md">
                      <span className="drop-shadow">V</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900 text-lg">Vikram Singh</h4>
                      <p className="text-gray-600 text-sm">Financial Analyst, Delhi</p>
                      <div className="flex mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-4 -left-2 text-5xl text-amber-100/80 leading-4">"</div>
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed relative z-10">
                      The community support and live sessions are incredible. I learned more in 3 months here than in 2 years of self-study. Highly recommend!
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-amber-100 flex items-center text-sm text-amber-600 font-medium">
                    <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Active Community Member</span>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>

            {/* Custom Navigation */}
            <div className="flex items-center justify-center mt-10 space-x-4">
              <button className="testimonial-prev flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 text-emerald-600 hover:bg-emerald-50 border border-emerald-100">
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="testimonial-pagination flex space-x-2"></div>

              <button className="testimonial-next flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 text-emerald-600 hover:bg-emerald-50 border border-emerald-100">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Custom CSS for pagination */}
        <style jsx>{`
    .testimonial-bullet {
      display: inline-block;
      width: 10px;
      height: 10px;
      background-color: #cbd5e1;
      border-radius: 50%;
      margin: 0 4px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .testimonial-bullet-active {
      background-color: #059669;
      width: 24px;
      border-radius: 8px;
    }
  `}</style>
      </section >


      {/* Enhanced Contact Section */}
      < section id="contacts" className="py-24 bg-gradient-to-br from-gray-50 via-white to-emerald-50" >
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-600 rounded-full font-medium text-sm mb-6">
              <Mail className="w-4 h-4 mr-2" />
              Get in Touch
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Have Questions?
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 mt-2">
                We're Here to Help
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get personalized guidance on your crypto learning journey. Our expert team is ready to support you every step of the way.
            </p>
          </div>
          {/* Contact Content */}
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Address Card */}
              <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 hover:-translate-y-2">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <MapPin size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors duration-300">Visit Our Office</h3>
                    <p className="text-gray-600 leading-relaxed">
                      No 6, Third Floor<br />
                      Kumaran Colony Main Road<br />
                      Vadapalani, Chennai<br />
                      Tamil Nadu, India
                    </p>
                  </div>
                </div>
              </div>
              {/* Email Card */}
              <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 hover:-translate-y-2">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Mail size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">Email Us</h3>
                    <p className="text-gray-600">admin@keysystem.in</p>
                    <p className="text-sm text-gray-500 mt-1">We'll respond within 24 hours</p>
                  </div>
                </div>
              </div>
              {/* Newsletter Card */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-8 rounded-3xl shadow-xl text-white">
                <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
                <p className="mb-6 opacity-90">Get the latest crypto insights, trading tips, and course updates delivered to your inbox.</p>
                <form className="flex flex-col gap-4">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="px-4 py-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-white/50 transition duration-300"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-white text-emerald-600 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors duration-300 shadow-lg hover:shadow-xl"
                  >
                    Subscribe Now
                  </button>
                </form>
              </div>
            </div>
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <form
                onSubmit={handleFormSubmit}
                className="bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Send us a Message</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-300"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-300"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-300"
                    placeholder="What's this about?"
                  />
                </div>
                <div className="mb-8">
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows="6"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-300 resize-none"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-5 rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  Send Message
                </button>
                {formMessage && (
                  <div className="mt-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 animate-pulse">
                    {formMessage}
                  </div>
                )}
              </form>

            </div>

          </div>
        </div>

      </section >

    </div >

  );
};

export default Home;