import React, { useState } from "react";
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
} from "lucide-react";

import { FileText } from "lucide-react";


const Home = () => {
  const [counters] = useState({
    lessons: 250,
    languages: 8,
    rating: 4.8,
  });

  const heroImage =
    "https://images.pexels.com/photos/14354113/pexels-photo-14354113.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [formMessage, setFormMessage] = useState('');

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
    <div className="w-full h-full">
      {/* Hero Section */}
      <section
  id="home"
  className="relative w-full h-screen flex items-center justify-center text-center px-6 sm:px-10 lg:px-20"
>
  {/* Blurred Background Image */}
  <div className="absolute inset-0">
    <img
      src={heroImage}
      alt="Background"
      className="w-full h-full object-cover blur-md brightness-50"
    />
  </div>

  {/* Content */}
  <div className="relative z-10 max-w-3xl text-white">
    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
  Grow Your Wealth with
  <span className="block text-teal-400 mt-2 animate-pulse">
    Crypto Knowledge
  </span>
</h1>
<p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl max-w-xl mx-auto">
  Learn blockchain, trading, and digital assets — in simple.<br />
  Step-by-step lessons, real-world strategies, and certificates as you progress.
</p>

    {/* CTA Button */}
    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
      <button className="group flex items-center justify-center bg-gradient-to-r from-teal-600 to-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:from-teal-700 hover:to-green-700 transform hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-2xl">
        Start Learning for Free
        <ArrowRight className="ml-2 sm:ml-3 h-5 sm:h-6 w-5 sm:w-6 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>

    {/* Features */}
    <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm text-gray-200">
      <div className="flex items-center bg-white/10 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
        <ShieldCheck className="h-4 w-4 mr-1.5 text-teal-300" />
        Safe & Secure
      </div>
      <div className="flex items-center bg-white/10 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
        <BookOpen className="h-4 w-4 mr-1.5 text-teal-300" />
        Free Lessons
      </div>
      <div className="flex items-center bg-white/10 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
        <Gift className="h-4 w-4 mr-1.5 text-teal-300" />
        Get Certificate
      </div>
    </div>
  </div>
</section>



  {/* About Section */}
<section id="about" className="py-20 bg-white dark:bg-gray-800">
  <div className="container mx-auto px-6">
    <div className="text-center mb-16">
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
        Your Gateway to <span className="text-teal-600 dark:text-teal-400">Crypto Mastery</span>
      </h2>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
        Learn cryptocurrency and blockchain the easy way — through videos, documents, live events, and interactive tasks. 
        Key Kissan is designed to help you grow from beginner to expert, step-by-step.
      </p>
    </div>

    {/* Feature Grid */}
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl text-center hover:shadow-lg transition duration-300">
        <div className="w-16 h-16 mx-auto bg-teal-100 dark:bg-teal-900 flex items-center justify-center rounded-full shadow-md">
          <BookOpen className="text-teal-600 dark:text-teal-400" size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4">
          Video Classes
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Easy-to-follow crypto lessons with clear explanations and real examples.
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl text-center hover:shadow-lg transition duration-300">
        <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 flex items-center justify-center rounded-full shadow-md">
          <FileText className="text-blue-600 dark:text-blue-400" size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4">
          Documents & Guides
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Downloadable resources to learn offline and revise anytime.
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl text-center hover:shadow-lg transition duration-300">
        <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900 flex items-center justify-center rounded-full shadow-md">
          <Calendar className="text-purple-600 dark:text-purple-400" size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4">
          Live Events
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Interactive webinars and Q&A sessions with crypto experts.
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl text-center hover:shadow-lg transition duration-300">
        <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 flex items-center justify-center rounded-full shadow-md">
          <Award className="text-green-600 dark:text-green-400" size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4">
          Tasks & Certificates
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Test your skills, complete tasks, and earn recognized certificates.
        </p>
      </div>
    </div>
  </div>
</section>


    {/* Features Section */}
<section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
  <div className="container mx-auto px-6">
    <div className="text-center mb-16">
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
        Everything You <span className="text-teal-600 dark:text-teal-400">Need to Master Crypto</span>
      </h2>
      <p className="text-xl text-gray-600 dark:text-gray-300">
        Learn, practice, and grow your crypto skills — all in one place.
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-12">
      {/* Feature 1 */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow hover:shadow-lg transition">
        <div className="flex items-center justify-center w-14 h-14 bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400 rounded-full mb-6">
          <BookOpen size={28} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Bite-Sized Lessons
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Master blockchain, trading, and DeFi concepts with short, easy-to-understand lessons in your local language.
        </p>
        <ul className="space-y-2 text-gray-500 dark:text-gray-400">
          <li className="flex items-center"><Check className="text-teal-500 mr-2" /> 5–10 minute modules</li>
          <li className="flex items-center"><Check className="text-teal-500 mr-2" /> Local language support</li>
          <li className="flex items-center"><Check className="text-teal-500 mr-2" /> Quizzes after every topic</li>
        </ul>
      </div>

      {/* Feature 2 */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow hover:shadow-lg transition">
        <div className="flex items-center justify-center w-14 h-14 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full mb-6">
          <Calendar size={28} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Live Crypto Sessions
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Learn directly from crypto experts, traders, and educators. Join Q&A sessions and connect with the community.
        </p>
        <ul className="space-y-2 text-gray-500 dark:text-gray-400">
          <li className="flex items-center"><Check className="text-teal-500 mr-2" /> Weekly live webinars</li>
          <li className="flex items-center"><Check className="text-teal-500 mr-2" /> Interactive Q&A</li>
          <li className="flex items-center"><Check className="text-teal-500 mr-2" /> Networking with learners</li>
        </ul>
      </div>

      {/* Feature 3 */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow hover:shadow-lg transition">
        <div className="flex items-center justify-center w-14 h-14 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full mb-6">
          <Award size={28} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Earn Certificates & Rewards
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Complete courses and earn blockchain-verified certificates. Get rewards as you learn and level up.
        </p>
        <ul className="space-y-2 text-gray-500 dark:text-gray-400">
          <li className="flex items-center"><Check className="text-teal-500 mr-2" /> Blockchain-based certificates</li>
          <li className="flex items-center"><Check className="text-teal-500 mr-2" /> Learn-to-earn rewards</li>
          <li className="flex items-center"><Check className="text-teal-500 mr-2" /> Track your progress</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section
  id="features-extended"
  className="w-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-20"
>
  <div className="container mx-auto px-6">
    {/* Heading */}
    <div className="text-center mb-16">
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
        More Than Just a <span className="text-teal-600 dark:text-teal-400">Crypto Learning Platform</span>
      </h2>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        We’ve built a complete Web3 education hub that helps you learn, practice, and grow — all while earning rewards.
      </p>
    </div>

    {/* Cards Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Card 1 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 flex flex-col p-6">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-3">
            <BookOpen className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Interactive Crypto Lessons
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6 flex-1">
          Learn blockchain, NFTs, DeFi, and crypto trading with bite-sized lessons and hands-on practice modules.
        </p>
        <button className="w-full px-4 py-2 bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-lg font-medium hover:from-teal-700 hover:to-green-700 transition-all duration-300 mt-auto">
          Start Learning
        </button>
      </div>

      {/* Card 2 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 flex flex-col p-6">
        <div className="flex items-center mb-4">
          <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mr-3">
            <ShieldCheck className="text-green-600 dark:text-green-400" size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Safe & Trusted Learning
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6 flex-1">
          Our platform uses secure blockchain technology so your progress, certificates, and rewards are always protected.
        </p>
        <button className="w-full px-4 py-2 bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-lg font-medium hover:from-teal-700 hover:to-green-700 transition-all duration-300 mt-auto">
          Explore Security
        </button>
      </div>

      {/* Card 3 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 flex flex-col p-6">
        <div className="flex items-center mb-4">
          <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mr-3">
            <Award className="text-purple-600 dark:text-purple-400" size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Earn Blockchain Certificates
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6 flex-1">
          Complete courses to earn blockchain-verified certificates and crypto rewards you can share with employers or the community.
        </p>
        <button className="w-full px-4 py-2 bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-lg font-medium hover:from-teal-700 hover:to-green-700 transition-all duration-300 mt-auto">
          Get Certified
        </button>
      </div>
    </div>
  </div>
</section>


{/* Contact Section */}
<section id="contacts" className="py-20 bg-gray-50 dark:bg-gray-900">
  <div className="container mx-auto px-6">
    {/* Header */}
    <div className=" mb-5">
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
        Get In <span className="text-teal-600 dark:text-teal-400">Touch</span>
      </h2>
      
    </div>

    {/* Contact Info + Form */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Contact Info */}
      <div className="space-y-6">
        <div className="flex items-start space-x-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition duration-300">
          <div className="bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400 p-3 rounded-full shadow-sm">
            <MapPin size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Our Address</h3>
            <p className="text-gray-600 dark:text-gray-400">
              No 6 third floor Kumaran colony main road Vadapalani Chennai
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition duration-300">
          <div className="bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400 p-3 rounded-full shadow-sm">
            <Mail size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Email Us</h3>
            <p className="text-gray-600 dark:text-gray-400">admin@keysystem.in</p>
          </div>
        </div>
       

        {/* Subscribe Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Subscribe to Our Updates</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get the latest news and insights directly to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-300"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-lg font-semibold hover:from-teal-700 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Contact Form */}
      <form
        onSubmit={handleFormSubmit}
        className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl hover:shadow-2xl -mt-10 transition duration-300"
      >
        <div>
          <label htmlFor="name" className="block text-left text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-300"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-left text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-300"
          />
        </div>
        <div>
          <label htmlFor="subject" className="block text-left text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subject
          </label>
          <input
            type="text"
            name="subject"
            id="subject"
            required
            value={formData.subject}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-300"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-left text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message
          </label>
          <textarea
            name="message"
            id="message"
            rows="4"
            required
            value={formData.message}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-300"
          ></textarea>
        </div>
        <div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-600 to-green-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:from-teal-700 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Send Message
          </button>
        </div>
        {formMessage && (
          <div className="text-center p-3 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-lg animate-pulse">
            {formMessage}
          </div>
        )}
      </form>
    </div>
  </div>




  

</section>


    
      {/* CTA Section */}
<section className="py-20 bg-gradient-to-r from-teal-600 to-green-600 text-white relative overflow-hidden">
  {/* Soft Background Glow */}
  <div className="absolute inset-0 opacity-10">
    <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
  </div>

  <div className="container mx-auto px-6 text-center relative z-10">
    <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
      Take Control of Your <span className="underline decoration-white/40">Crypto Learning</span> Today
    </h2>
    <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
      Whether you’re a beginner or building your portfolio, our step-by-step lessons help you learn faster, trade smarter, and grow with confidence — all in just a few minutes a day.
    </p>

    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <button className="bg-white text-teal-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transform hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-2xl">
        Start Learning Now
      </button>
      <button className="border-2 border-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-teal-600 transform hover:-translate-y-1 transition-all duration-300 shadow-lg">
        Explore Courses
      </button>
    </div>
  </div>
</section>

    </div>
  );
};

export default Home;