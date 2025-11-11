import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../lib/firebase"; 
import { registerWithOTP } from "../redux/features/auth/authSlice";
import toast from "react-hot-toast";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

  // Initialize reCAPTCHA on component mount
  useEffect(() => {
    const initializeRecaptcha = async () => {
      try {
        // Clean up any existing verifier
        if (window.recaptchaVerifier) {
          try {
            await window.recaptchaVerifier.clear();
          } catch (error) {
            console.log("Error clearing existing verifier:", error);
          }
          window.recaptchaVerifier = null;
        }

        // Clear the container element to ensure it's empty
        const container = document.getElementById("recaptcha-container-register");
        if (container) {
          container.innerHTML = '';
        }

        // Create new verifier with unique container for register
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container-register", {
          size: "invisible",
        });
        
        // Only render if not already rendered
        try {
          await window.recaptchaVerifier.render();
        } catch (error) {
          if (error.code === 'auth/argument-error' && error.message.includes('already been rendered')) {
            console.log("reCAPTCHA already rendered, skipping render");
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.error("Error initializing reCAPTCHA:", error);
      }
    };

    initializeRecaptcha();

    // Cleanup on unmount
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (error) {
          console.log("Error during cleanup:", error);
        }
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  // Display Redux errors as toasts
  useEffect(() => {
    if (error) {
      // toast.error(error);
    }
  }, [error]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
      return toast.error("Please enter a valid 10-digit phone number.");
    }
    
    try {
      const appVerifier = window.recaptchaVerifier;
      const formattedPhoneNumber = `+91${formData.phoneNumber}`;
      
      const result = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      
      setConfirmationResult(result);
      setOtpSent(true);
      toast.success("OTP sent successfully!");

    } catch (err) {
      console.error("Error sending OTP:", err);
      toast.error("Failed to send OTP. Please try again or check the console.");
    }
  };

  const handleResendOtp = async () => {
    try {
      const appVerifier = window.recaptchaVerifier;
      const formattedPhoneNumber = `+91${formData.phoneNumber}`;
      
      const result = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      
      setConfirmationResult(result);
      setOtpSent(true);
      toast.success("OTP resent successfully!");

    } catch (err) {
      console.error("Error resending OTP:", err);
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confirmationResult) return toast.error("Please request an OTP first.");
    if (otp.length !== 6) return toast.error("Please enter a valid 6-digit OTP.");

    try {
      const userCredential = await confirmationResult.confirm(otp);
      const idToken = await userCredential.user.getIdToken();

      const registrationData = {
        idToken,
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      };

      await dispatch(registerWithOTP(registrationData)).unwrap();
      
      // Registration successful, redirect to login page
      toast.success("Registration successful! Please log in to continue.");
      navigate("/login");

    } catch (err) {
      // Error toast is handled by the useEffect hook
      console.error("Registration error:", err);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Decorative header */}
        <div className="bg-gradient-to-r from-teal-600 to-green-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="text-teal-100">Join us and start your journey!</p>
        </div>
        
        {/* Main content */}
        <div className="p-8">
          {/* Hidden reCAPTCHA container */}
          <div id="recaptcha-container-register" className="hidden"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name input */}
            <div className="group">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-teal-300 rounded-lg text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-teal-200 focus:border-teal-500 focus:outline-none transition-all duration-200 group-hover:border-teal-400 disabled:bg-gray-100 disabled:text-gray-500"
                required
                disabled={otpSent}
              />
            </div>

            {/* Email input */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-teal-300 rounded-lg text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-teal-200 focus:border-teal-500 focus:outline-none transition-all duration-200 group-hover:border-teal-400 disabled:bg-gray-100 disabled:text-gray-500"
                disabled={otpSent}
              />
            </div>
            
            {/* Phone input */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number *
              </label>
              <div className="flex rounded-lg shadow-sm group">
                <span className="inline-flex items-center px-4 rounded-l-lg border-2 border-r-0 border-teal-300 bg-gray-50 text-teal-700 text-sm font-medium transition-all duration-200 group-hover:border-teal-400 group-focus-within:border-teal-500">
                  +91
                </span>
                <input
                  id="phoneNumber"
                  type="tel"
                  name="phoneNumber"
                  placeholder="Enter 10-digit number"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="flex-1 min-w-0 block w-full px-4 py-3 rounded-r-lg border-2 border-l-0 border-teal-300 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-teal-200 focus:border-teal-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-200 group-hover:border-teal-400"
                  required
                  disabled={otpSent || loading}
                  maxLength={10}
                />
              </div>
              {!otpSent && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || formData.phoneNumber.length !== 10}
                  className={`w-full mt-4 px-4 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center ${
                    (loading || formData.phoneNumber.length !== 10)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending OTP...
                    </>
                  ) : 'Send OTP'}
                </button>
              )}
            </div>
            
            {/* OTP Input */}
            {otpSent && (
              <div className="space-y-4 transition-all duration-300 ease-in-out">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                    Enter OTP *
                  </label>
                  <div className="relative">
                    <div className="relative group">
                      <input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="block w-full px-4 py-3 pl-12 border-2 border-teal-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-200 focus:border-teal-500 focus:outline-none text-lg font-mono tracking-widest text-center text-gray-700 placeholder-gray-400 transition-all duration-200 group-hover:border-teal-400"
                        required
                        maxLength={6}
                        autoFocus
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                      <span className="text-sm text-gray-500">
                        {otp.length}/6
                      </span>
                    </div>
                  </div>
                  <div className="mt-1 flex justify-between">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-sm font-medium text-teal-600 hover:text-teal-800 hover:underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className={`w-full px-4 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center ${
                    (loading || otp.length !== 6)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : 'Create Account'}
                </button>
              </div>
            )}
          </form>
          
          {/* Help text */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Already have an account? <a href="/login" className="font-medium text-teal-600 hover:text-teal-800 hover:underline">Sign in</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;