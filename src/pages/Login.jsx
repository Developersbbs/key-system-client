import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../lib/firebase"; 
import { loginWithOTP } from "../redux/features/auth/authSlice";
import toast from 'react-hot-toast';

const Login = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  
  // Display Redux errors as toasts
  useEffect(() => {
    if (error) {
      // toast.error(error);
    }
  }, [error]);

  // Initialize reCAPTCHA on component mount
  useEffect(() => {
    const initializeRecaptcha = async () => {
      try {
        // Force clear any existing verifier
        if (window.recaptchaVerifier) {
          try {
            await window.recaptchaVerifier.clear();
          } catch (error) {
            console.log("Error clearing existing verifier:", error);
          }
          window.recaptchaVerifier = null;
        }

        // Clear all possible container IDs
        const containerIds = ['recaptcha-container', 'recaptcha-container-login', 'recaptcha-container-register'];
        containerIds.forEach(id => {
          const container = document.getElementById(id);
          if (container) {
            container.innerHTML = '';
            container.removeAttribute('data-sitekey');
            container.removeAttribute('data-type');
            container.removeAttribute('data-size');
            container.removeAttribute('data-callback');
            container.removeAttribute('data-expired-callback');
          }
        });

        // Clear any global reCAPTCHA state
        if (window.grecaptcha) {
          try {
            window.grecaptcha.reset();
          } catch (e) {
            console.log("Error resetting grecaptcha:", e);
          }
        }

        // Wait longer to ensure complete cleanup
        await new Promise(resolve => setTimeout(resolve, 300));

        // Create new verifier with unique container for login
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container-login", {
          size: "invisible",
        });
        
        // Render the new verifier
        await window.recaptchaVerifier.render();
        console.log("reCAPTCHA initialized successfully for Login");
        
      } catch (error) {
        console.error("Error initializing reCAPTCHA:", error);
        
        // Force complete reset if still failing
        try {
          // Clear everything
          window.recaptchaVerifier = null;
          
          // Remove all reCAPTCHA related elements
          const allContainers = document.querySelectorAll('[id*="recaptcha"]');
          allContainers.forEach(container => {
            container.innerHTML = '';
            container.remove();
          });
          
          // Recreate the container
          const newContainer = document.createElement('div');
          newContainer.id = 'recaptcha-container-login';
          document.body.appendChild(newContainer);
          
          // Wait and retry
          setTimeout(async () => {
            try {
              window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container-login", {
                size: "invisible",
              });
              await window.recaptchaVerifier.render();
              console.log("reCAPTCHA force retry successful");
            } catch (retryError) {
              console.error("reCAPTCHA force retry failed:", retryError);
              toast.error("reCAPTCHA initialization failed. Please refresh the page.");
            }
          }, 1000);
          
        } catch (cleanupError) {
          console.error("Error during force cleanup:", cleanupError);
        }
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

  const handleSendOtp = async () => {
    console.log("[DEBUG] handleSendOtp called with phone:", phone);
    
    if (!phone || phone.length !== 10) {
      const errorMsg = "Please enter a valid 10-digit phone number.";
      console.error("[DEBUG] Validation failed:", errorMsg);
      return toast.error(errorMsg);
    }
    
    try {
      console.log("[DEBUG] Initializing reCAPTCHA verifier");
      const appVerifier = window.recaptchaVerifier;
      const formattedPhoneNumber = `+91${phone}`;
      
      console.log("[DEBUG] Sending OTP to:", formattedPhoneNumber);
      console.log("[DEBUG] reCAPTCHA verifier state:", {
        type: typeof window.recaptchaVerifier,
        container: document.getElementById('recaptcha-container-login')?.outerHTML
      });
      
      const result = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      console.log("[DEBUG] OTP sent successfully, confirmation result:", result);
      
      setConfirmationResult(result);
      setOtpSent(true);
      toast.success("OTP sent successfully!");

    } catch (err) {
      console.error("[DEBUG] Error in handleSendOtp:", {
        name: err.name,
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      toast.error(err.message || "Failed to send OTP. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    if (!phone || phone.length !== 10) {
      return toast.error("Please enter a valid phone number first.");
    }
    
    try {
      const appVerifier = window.recaptchaVerifier;
      const formattedPhoneNumber = `+91${phone}`;
      
      const result = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      
      setConfirmationResult(result);
      toast.success("New OTP sent successfully!");
      
    } catch (err) {
      console.error("Error resending OTP:", err);
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[DEBUG] handleSubmit called with OTP:", otp);
    
    if (!confirmationResult) {
      console.error("[DEBUG] No confirmation result available");
      return toast.error("Please request an OTP first.");
    }
    
    if (otp.length !== 6) {
      console.error("[DEBUG] Invalid OTP length:", otp.length);
      return toast.error("Please enter a valid 6-digit OTP.");
    }

    try {
      console.log("[DEBUG] Verifying OTP...");
      const userCredential = await confirmationResult.confirm(otp);
      console.log("[DEBUG] OTP verified successfully, user:", userCredential.user);
      
      console.log("[DEBUG] Getting ID token...");
      const idToken = await userCredential.user.getIdToken();
      console.log("[DEBUG] ID token retrieved, length:", idToken ? idToken.length : 0);

      const loginData = { idToken, rememberMe: true };
      console.log("[DEBUG] Dispatching loginWithOTP with data:", { 
        hasToken: !!idToken,
        rememberMe: true 
      });

      const resultAction = await dispatch(loginWithOTP(loginData)).unwrap();
      console.log("[DEBUG] Login response:", resultAction);
      
      if (!resultAction) {
        throw new Error("No user data returned from server");
      }
      
      const userRole = resultAction.role;
      console.log("[DEBUG] Login successful, user role:", userRole);
      toast.success("Login successful! Welcome back.");
      
      const redirectPath = userRole === "admin" ? "/admin/dashboard" : "/member";
      console.log("[DEBUG] Navigating to:", redirectPath);
      navigate(redirectPath);

    } catch (err) {
      console.error("[DEBUG] Error in handleSubmit:", {
        name: err.name,
        message: err.message,
        code: err.code,
        response: err.response,
        stack: err.stack
      });
      toast.error(err.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Decorative header */}
        <div className="bg-gradient-to-r from-teal-600 to-green-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome Back!</h1>
          <p className="text-teal-100">Login to access your account</p>
        </div>
        
        {/* Main content */}
        <div className="p-8">
          {/* Hidden reCAPTCHA container */}
          <div id="recaptcha-container-login" className="hidden"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone input */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <div className="flex rounded-lg shadow-sm group">
                <span className="inline-flex items-center px-4 rounded-l-lg border-2 border-r-0 border-teal-300 bg-gray-50 text-teal-700 text-sm font-medium transition-all duration-200 group-hover:border-teal-400 group-focus-within:border-teal-500">
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter 10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
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
                  disabled={loading || phone.length !== 10}
                  className={`w-full mt-4 px-4 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center ${
                    (loading || phone.length !== 10) 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending OTP...
                    </span>
                  ) : 'Send OTP'}
                </button>
              )}
            </div>
            
            {/* OTP Input */}
            {otpSent && (
              <div className="space-y-4 transition-all duration-300 ease-in-out">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                    Enter OTP
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
                  <div className="mt-1 flex justify-end">
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
                      Verifying...
                    </>
                  ) : 'Verify & Continue'}
                </button>
              </div>
            )}
          </form>
          
          {/* Help text */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>We'll send you a verification code via SMS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;