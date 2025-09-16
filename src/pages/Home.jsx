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
  Headphones
} from "lucide-react";
import { FileText } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Link } from "react-router-dom";

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
      {/* Hero Section with Enhanced Slider */}
      <section
        id="home"
        className="relative w-full h-screen flex items-center justify-center text-center px-4 sm:px-6 md:px-8 lg:px-16 xl:px-20 overflow-hidden"
      >
        {/* Enhanced Slider Background */}
        <div className="absolute inset-0">
          {sliderImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-150 scale-100' : 'opacity-0 scale-105'
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
              className={`transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-6 md:w-8 h-2 md:h-3 bg-emerald-400 rounded-full' 
                  : 'w-2 h-2 md:w-3 md:h-3 bg-white/50 rounded-full hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>

        {/* Enhanced Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 w-full">
          <div className="mb-4 md:mb-6 inline-flex items-center px-3 py-1 md:px-4 md:py-2 bg-emerald-500/20 backdrop-blur-md rounded-full border border-emerald-400/30">
            <Zap className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-emerald-300" />
            <span className="text-xs md:text-sm font-medium text-emerald-200">India's #1 Crypto Education Platform</span>
          </div>
          
          <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight mb-4 md:mb-6 text-white">
            Master Crypto Trading from 
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 mt-2 md:mt-3 animate-pulse">
              Zero to Pro
            </span>
          </h1>
          
          <p className="mt-4 md:mt-6 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-gray-100">
            Join <span className="font-bold text-emerald-300">10,000+</span> successful traders who transformed their financial future through our expert-led courses, live simulations, and proven strategies.
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
            <button className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg hover:from-emerald-600 hover:via-teal-600 hover:to-green-600 transform hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-300 shadow-lg md:shadow-xl hover:shadow-emerald-500/25">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center">
                Start Learning for Free
                <ArrowRight className="ml-2 md:ml-3 h-4 w-4 md:h-6 md:w-6 group-hover:translate-x-1 md:group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </button>
            
            <button className="group relative overflow-hidden border-2 border-white/40 backdrop-blur-md text-white px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg hover:bg-white hover:text-emerald-600 transform hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-300 shadow-lg md:shadow-xl">
              <div className="relative flex items-center justify-center">
                <Play className="mr-2 md:mr-3 h-4 w-4 md:h-6 md:w-6 group-hover:scale-110 transition-transform duration-300" />
                Watch Demo
              </div>
            </button>
          </div>

          {/* Enhanced Feature Pills */}
          <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-2 md:gap-3">
            <div className="flex items-center bg-white/10 backdrop-blur-md px-3 py-2 md:px-4 md:py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300">
              <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2 text-emerald-300" />
              <span className="text-xs md:text-sm text-gray-300 font-medium">100% Safe & Secure</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-md px-3 py-2 md:px-4 md:py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300">
              <BookOpen className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2 text-teal-300" />
              <span className="text-xs md:text-sm font-medium text-gray-300">250+ Free Lessons</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-md px-3 py-2 md:px-4 md:py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300">
              <Award className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2 text-green-300" />
              <span className="text-xs md:text-sm font-medium text-gray-300">Certified Courses</span>
            </div>
          </div>
        </div>
      </section>
    
      {/* Enhanced Key Features Section */}
      <section id="features" className="py-24 bg-gradient-to-br from-gray-50 via-white to-emerald-50">
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
              Our comprehensive platform provides cutting-edge tools and expert guidance to transform beginners into confident crypto traders.
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
                  Live Trading Simulator
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Practice with virtual funds in real market conditions. Build confidence completely risk-free.
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
      </section>

      {/* Enhanced Stats Section */}
     <section className="py-12 md:py-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 relative overflow-hidden">
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
</section>

      {/* Enhanced Learning Path Section */}
      <section className="py-24 bg-white">
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
              Follow our proven 4-stage journey from complete beginner to confident professional trader.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-20 left-1/2 transform -translate-x-1/2 w-full h-0.5 bg-gradient-to-r from-emerald-200 via-blue-200 to-purple-200"></div>
            {/* Step Cards */}
            {[
              { step: 1, title: "Foundation", subtitle: "Beginner", icon: BookOpen, color: "emerald", desc: "Master crypto basics, blockchain fundamentals, and essential market terminology." },
              { step: 2, title: "Application", subtitle: "Intermediate", icon: TrendingUp, color: "blue", desc: "Learn trading strategies, technical analysis, and market psychology principles." },
              { step: 3, title: "Mastery", subtitle: "Advanced", icon: Award, color: "purple", desc: "Explore DeFi, advanced techniques, and professional portfolio management." },
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
      </section>

      {/* Enhanced Pricing Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-600 rounded-full font-medium text-sm mb-6">
              <PieChart className="w-4 h-4 mr-2" />
              Pricing Plans
            </div>
           <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
  Choose Your 
  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-teal-600 to-emerald-600">
    Learning Adventure
  </span>
</h2>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Flexible plans designed to fit every learning style and budget. Start free, upgrade anytime.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 hover:-translate-y-2">
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-2xl shadow-md mb-6">
                  <BookOpen className="text-gray-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Starter</h3>
                <div className="flex justify-center items-baseline my-6">
                  <span className="text-5xl font-black text-gray-900">₹0</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                <p className="text-gray-600 mb-8">Perfect for exploring crypto basics</p>
                <button className="w-full bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 py-4 rounded-2xl font-bold text-lg hover:from-gray-300 hover:to-gray-400 transition-all duration-300 shadow-md hover:shadow-lg">
                  Get Started Free
                </button>
              </div>
              <div className="p-8 pt-0">
                <ul className="space-y-4">
                  {["3 foundational courses", "Basic trading simulator", "Community forum access", "Email support"].map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <Check className="text-emerald-500 mr-3 flex-shrink-0" size={20} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-emerald-500 hover:-translate-y-4 scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                MOST POPULAR
              </div>
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center rounded-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro Trader</h3>
                <div className="flex justify-center items-baseline my-6">
                  <span className="text-5xl font-black text-gray-900">₹2,999</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                <p className="text-gray-600 mb-8">Most popular for serious learners</p>
                <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Go Pro Today
                </button>
              </div>
              <div className="p-8 pt-0">
                <ul className="space-y-4">
                  {["All Free features", "Complete course library (20+ courses)", "Advanced trading simulator", "Live workshops and events", "Priority chat support", "Progress certificates"].map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <Check className="text-emerald-500 mr-3 flex-shrink-0" size={20} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 hover:-translate-y-2">
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center rounded-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Award className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Master</h3>
                <div className="flex justify-center items-baseline my-6">
                  <span className="text-5xl font-black text-gray-900">₹4,999</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                <p className="text-gray-600 mb-8">For dedicated crypto professionals</p>
                <button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Become a Master
                </button>
              </div>
              <div className="p-8 pt-0">
                <ul className="space-y-4">
                  {["All Pro features", "1-on-1 mentor sessions", "Exclusive advanced strategies", "Portfolio review sessions", "Direct instructor access", "Lifetime course updates"].map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <Check className="text-emerald-500 mr-3 flex-shrink-0" size={20} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-emerald-50/50 relative overflow-hidden">
  {/* Background decorative elements */}
  <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-200/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
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
                Key Kissan completely changed my approach to crypto. I went from losing money on random trades to making consistent profits using their strategies!
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-emerald-100 flex items-center text-sm text-emerald-600 font-medium">
              <TrendingUp className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>+340% Portfolio Growth in 6 months</span>
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
                The structured learning path and expert mentorship helped me build a diversified crypto portfolio. Now I confidently trade and even teach my friends!
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
</section>


      {/* Enhanced Contact Section */}
      <section id="contacts" className="py-24 bg-gradient-to-br from-gray-50 via-white to-emerald-50">
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
        
      </section>
      
    </div>
    
  );
};

export default Home;