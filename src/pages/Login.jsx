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
      toast.error(error);
    }
  }, [error]);

  // Initialize reCAPTCHA on component mount
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
      window.recaptchaVerifier.render().catch(console.error);
    }
  }, []);

  const handleSendOtp = async () => {
    if (!phone || phone.length !== 10) {
      return toast.error("Please enter a valid 10-digit phone number.");
    }
    
    try {
      const appVerifier = window.recaptchaVerifier;
      const formattedPhoneNumber = `+91${phone}`;
      
      const result = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      
      setConfirmationResult(result);
      setOtpSent(true);
      toast.success("OTP sent successfully!");

    } catch (err) {
      console.error("Error sending OTP:", err);
      toast.error(err.message || "Failed to send OTP. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confirmationResult) return toast.error("Please request an OTP first.");
    if (otp.length !== 6) return toast.error("Please enter a valid 6-digit OTP.");

    try {
      const userCredential = await confirmationResult.confirm(otp);
      const idToken = await userCredential.user.getIdToken();

      // The backend login controller only needs the idToken
      const loginData = { idToken, rememberMe: true };

      // Dispatch and wait for the result
      const resultAction = await dispatch(loginWithOTP(loginData)).unwrap();
      
      // The user object is the result of the action
      const userRole = resultAction.role;
      toast.success("Login successful! Welcome back.");
      
      // Navigate based on the role from the successful response
      navigate(userRole === "admin" ? "/admin/dashboard" : "/member");

    } catch (err) {
      toast.error(err || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg justify-center items-center mx-auto">
      {/* This div is required for Firebase reCAPTCHA */}
      <div id="recaptcha-container"></div>
      
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
        <p className="mt-2 text-gray-600">Login to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="tel"
            placeholder="10-Digit Mobile Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            required
            disabled={otpSent}
          />
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading || otpSent}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-green-600 text-gray-800 rounded-lg font-semibold disabled:opacity-50 shrink-0"
          >
            {loading ? '...' : otpSent ? 'Sent' : 'Send OTP'}
          </button>
        </div>
        
        {otpSent && (
          <div>
            <input
              type="number"
              placeholder="Enter 6-Digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 px-4 py-3 font-semibold text-white bg-gradient-to-r from-teal-600 to-green-600 rounded-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;