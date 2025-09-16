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
  Instagram
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
        className="relative w-full h-screen flex items-center justify-center text-center px-6 sm:px-10 lg:px-20 overflow-hidden"
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
                className="w-full h-full object-cover filter brightness-50"
              />
              <div className="absolute inset-0 bg-gradient-to-br via-black-700 to-black-900"></div>
              <div className="absolute inset-0 bg-black/20"></div>
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
          className="absolute left-4 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
        >
          <ChevronRight size={24} />
        </button>

        {/* Enhanced Slider Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-8 h-3 bg-emerald-400 rounded-full' 
                  : 'w-3 h-3 bg-white/50 rounded-full hover:bg-white/70'
              }`}
            ></button>
          ))}
        </div>

        {/* Enhanced Content */}
        <div className="relative z-10 max-w-4xl text-white">
          <div className="mb-6 inline-flex items-center px-4 py-2 bg-emerald-500/20 backdrop-blur-md rounded-full border border-emerald-400/30">
            <Zap className="w-4 h-4 mr-2 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-200">India's #1 Crypto Education Platform</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
            Master Crypto Trading from 
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 mt-3 animate-pulse">
              Zero to Pro
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed text-gray-100">
            Join <span className="font-bold text-emerald-300">10,000+</span> successful traders who transformed their financial future through our expert-led courses, live simulations, and proven strategies.
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <button className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-emerald-600 hover:via-teal-600 hover:to-green-600 transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/25">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center">
                Start Learning for Free
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </button>
            <button className="group relative overflow-hidden border-2 border-white/40 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-emerald-600 transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="relative flex items-center justify-center">
                <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                Watch Demo
              </div>
            </button>
          </div>

          {/* Enhanced Feature Pills */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <div className="flex items-center bg-white/10 backdrop-blur-md px-5 py-3 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300">
              <ShieldCheck className="h-5 w-5 mr-2 text-emerald-300" />
              <span className="text-sm font-medium">100% Safe & Secure</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-md px-5 py-3 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300">
              <BookOpen className="h-5 w-5 mr-2 text-teal-300" />
              <span className="text-sm font-medium">250+ Free Lessons</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-md px-5 py-3 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300">
              <Award className="h-5 w-5 mr-2 text-green-300" />
              <span className="text-sm font-medium">Certified Courses</span>
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
          <h2 className="text-xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
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
      <section className="py-20 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-black mb-2">10K+</div>
              <div className="text-lg opacity-90 group-hover:opacity-100">Happy Students</div>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-black mb-2">250+</div>
              <div className="text-lg opacity-90 group-hover:opacity-100">Video Lessons</div>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-black mb-2">98%</div>
              <div className="text-lg opacity-90 group-hover:opacity-100">Success Rate</div>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-black mb-2">24/7</div>
              <div className="text-lg opacity-90 group-hover:opacity-100">Support</div>
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
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-600 rounded-full font-medium text-sm mb-6">
              <Star className="w-4 h-4 mr-2" />
              Student Success Stories
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Real Results from
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-teal-600 to-teal-600 mt-2">
                Real Students
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
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
                delay: 5000,
                disableOnInteraction: false,
              }}
              pagination={{ clickable: true }}
              navigation={true}
              breakpoints={{
                // when window width >= 1024px (lg)
                1024: {
                  slidesPerView: 2,
                },
              }}
              className="mySwiper group" // Add group for potential hover effects if needed
            >
              {/* Testimonial 1 */}
              <SwiperSlide>
                <div className="h-full bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 border border-emerald-100">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                      P
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900 text-lg">Priya Sharma</h4>
                      <p className="text-gray-600">Software Engineer, Mumbai</p>
                      <div className="flex mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed italic">
                    "Key Kissan completely changed my approach to crypto. I went from losing money on random trades to making consistent profits using their strategies!"
                  </p>
                  <div className="mt-6 flex items-center text-sm text-emerald-600 font-medium">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    <span>+340% Portfolio Growth in 6 months</span>
                  </div>
                </div>
              </SwiperSlide>

              {/* Testimonial 2 */}
              <SwiperSlide>
                <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 border border-blue-100">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                      R
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900 text-lg">Rahul Patel</h4>
                      <p className="text-gray-600">Business Owner, Bangalore</p>
                      <div className="flex mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed italic">
                    "The structured learning path and expert mentorship helped me build a diversified crypto portfolio. Now I confidently trade and even teach my friends!"
                  </p>
                  <div className="mt-6 flex items-center text-sm text-blue-600 font-medium">
                    <Award className="w-4 h-4 mr-2" />
                    <span>Completed Advanced Certification</span>
                  </div>
                </div>
              </SwiperSlide>

              {/* Testimonial 3 */}
              <SwiperSlide>
               <div className="h-full bg-gradient-to-br from-pink-50 to-rose-50 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 border border-pink-100">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                      A
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900 text-lg">Anita Reddy</h4>
                      <p className="text-gray-600">Marketing Manager, Hyderabad</p>
                      <div className="flex mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed italic">
                    "As a complete beginner, I was overwhelmed by crypto. Key Kissan's step-by-step approach made everything clear. I now have a solid investment strategy."
                  </p>
                  <div className="mt-6 flex items-center text-sm text-pink-600 font-medium">
                    <Shield className="w-4 h-4 mr-2" />
                    <span>Risk-Free Learning Approach</span>
                  </div>
                </div>
              </SwiperSlide>

              {/* Testimonial 4 */}
              <SwiperSlide>
                <div className="h-full bg-gradient-to-br from-orange-50 to-yellow-50 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 border border-orange-100">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                      V
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900 text-lg">Vikram Singh</h4>
                      <p className="text-gray-600">Financial Analyst, Delhi</p>
                      <div className="flex mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed italic">
                    "The community support and live sessions are incredible. I learned more in 3 months here than in 2 years of self-study. Highly recommend!"
                  </p>
                  <div className="mt-6 flex items-center text-sm text-orange-600 font-medium">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Active Community Member</span>
                  </div>
                </div>
              </SwiperSlide>

            </Swiper>
          </div>
        </div>
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