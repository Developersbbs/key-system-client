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
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  }, []);

  // Display Redux errors as toasts
  useEffect(() => {
    if (error) {
      toast.error(error);
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

  // In pages/Register.jsx

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
    
    // ✅ CHANGED: Show a new message and redirect to the login page.
    toast.success("Registration successful! Please log in to continue.");
    navigate("/member");

  } catch (err) {
    toast.error(err || "Registration failed. This phone number may already be in use.");
  }
};
  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg items-center justify-center mx-auto">
      <div id="recaptcha-container"></div>
      
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Create an Account</h1>
        <p className="mt-2 text-gray-600">Join us and start your journey!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name *"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={otpSent}
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address (Optional)"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={otpSent}
        />
        
        <div className="flex gap-2">
          <input
            type="tel"
            name="phoneNumber"
            placeholder="10-Digit Mobile Number *"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={otpSent}
          />
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading || otpSent}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-green-600 text-gray-800 rounded-lg font-semibold disabled:opacity-50 shrink-0"
          >
            {otpSent ? 'Sent' : 'Send OTP'}
          </button>
        </div>
        
        {/* ✅ IMPROVEMENT: Only show OTP field after it has been sent */}
        {otpSent && (
          <div>
            <input
              type="number"
              placeholder="Enter 6-Digit OTP *"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 px-4 py-3 font-semibold text-white bg-gradient-to-r from-teal-600 to-green-600 rounded-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Registering..." : "Verify & Register"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Register;