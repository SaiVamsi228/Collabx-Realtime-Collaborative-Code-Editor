import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  auth,
  signInWithPopup, // Updated to popup
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  googleProvider,
  githubProvider,
} from "../firebase.js";
import Footer from "./Footer.jsx";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("signup") === "true") {
      setIsLogin(false);
    }
    console.log("AuthPage: Mounted at URL:", window.location.href);
  }, [location]);

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "This email is already registered. Try logging in.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password must be at least 6 characters long.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password. Try again.";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";
      case "auth/invalid-credential":
        return "Invalid credentials. Check your email or password.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      console.log("AuthPage: Initiating Google popup");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("AuthPage: Google popup successful, user:", result.user.uid);
      navigate("/dashboard");
    } catch (err) {
      console.error("AuthPage: Google popup error:", err);
      setError(getErrorMessage(err.code) || "Google login failed.");
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      console.log("AuthPage: Initiating GitHub popup");
      const result = await signInWithPopup(auth, githubProvider);
      console.log("AuthPage: GitHub popup successful, user:", result.user.uid);
      navigate("/dashboard");
    } catch (err) {
      console.error("AuthPage: GitHub popup error:", err);
      setError(getErrorMessage(err.code) || "GitHub login failed.");
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (isLogin) {
        console.log("AuthPage: Attempting email login");
        await signInWithEmailAndPassword(auth, email, password);
        console.log("AuthPage: Email login successful, user:", auth.currentUser.uid);
      } else {
        console.log("AuthPage: Attempting email signup");
        await createUserWithEmailAndPassword(auth, email, password);
        console.log("AuthPage: Email signup successful, user:", auth.currentUser.uid);
      }
      navigate("/dashboard");
    } catch (err) {
      console.error("AuthPage: Email auth error:", err);
      setError(getErrorMessage(err.code));
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email first.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent! Check your inbox.");
    } catch (err) {
      console.error("AuthPage: Password reset error:", err);
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="bg-white/100 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-[1.8rem] font-bold text-primary">
            <svg width="215.39307556152343" height="50.626132567226996" viewBox="0 0 383.8999938964844 90.23211137541728" className="looka-1j8o68f">
              {/* SVG content unchanged */}
            </svg>
          </div>
        </div>
      </header>
      <div className="card-container min-h-screen bg-gray-100">
        <div className="flex flex-col items-center mb-20">
          <div className="flex-grow flex justify-center items-center pt-20">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center min-h-[72vh]">
              <div className="flex bg-gray-200 rounded-lg overflow-hidden mb-6">
                <button
                  className={`flex-1 py-2 text-lg font-semibold transition-colors ${isLogin ? "bg-[#0B2273] text-white" : "text-gray-600"}`}
                  onClick={() => setIsLogin(true)}
                  disabled={loading}
                >
                  Login
                </button>
                <button
                  className={`flex-1 py-2 text-lg font-semibold transition-colors ${!isLogin ? "bg-[#0B2273] text-white" : "text-gray-600"}`}
                  onClick={() => setIsLogin(false)}
                  disabled={loading}
                >
                  Signup
                </button>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {isLogin ? "Login to Your Account" : "Create a New Account"}
              </h2>
              <button
                className="flex items-center justify-center w-full py-2 border rounded-lg bg-white text-gray-700 mb-2 hover:bg-gray-100"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 mr-3" />
                Continue with Google
              </button>
              <button
                className="flex items-center justify-center w-full py-2 border rounded-lg bg-white text-gray-700 hover:bg-gray-100"
                onClick={handleGitHubLogin}
                disabled={loading}
              >
                <img src="https://github.com/favicon.ico" alt="GitHub" className="w-5 mr-3" />
                Continue with GitHub
              </button>
              <div className="relative text-gray-600 text-sm my-4">
                <span className="bg-white px-2 relative z-10">or</span>
                <div className="absolute top-1/2 left-0 w-full h-px bg-gray-300"></div>
              </div>
              <form className="space-y-3" onSubmit={handleEmailSubmit}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full p-2 border rounded-lg bg-gray-50 focus:border-blue-500 outline-none"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full p-2 border rounded-lg bg-gray-50 focus:border-blue-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-[#0B2273] text-white rounded-lg font-semibold hover:bg-white hover:text-black transition-colors duration-200 hover:border-black border-2 border-transparent"
                >
                  {loading ? "Processing..." : isLogin ? "Login" : "Signup"}
                </button>
              </form>
              {isLogin && (
                <div className="text-sm text-black mt-3">
                  <a href="#" onClick={handleForgotPassword} className="hover:underline">
                    Forgot Password?
                  </a>
                </div>
              )}
              {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
              {success && <p className="text-green-500 text-sm mt-4">{success}</p>}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AuthPage;