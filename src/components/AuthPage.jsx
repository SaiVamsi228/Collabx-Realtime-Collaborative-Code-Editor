import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, signInWithRedirect, getRedirectResult, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, googleProvider, githubProvider } from '../firebase.js';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('signup') === 'true') {
      setIsLogin(false);
    }
  }, [location]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    setLoading(true);
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          navigate('/dashboard');
        }
      })
      .catch((err) => setError(getErrorMessage(err.code)))
      .finally(() => setLoading(false));
  }, [navigate]);

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Try logging in.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Try again.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/invalid-credential':
        return 'Invalid credentials. Check your email or password.';
      default:
        return 'Something went wrong. Please try again.';
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      setError(getErrorMessage(err.code));
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await signInWithRedirect(auth, githubProvider);
    } catch (err) {
      setError(getErrorMessage(err.code));
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email first.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      <div className="flex-grow flex justify-center items-center pt-20">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center min-h-[72vh]">
          <div className="flex bg-gray-200 rounded-lg overflow-hidden mb-6">
            <button
              className={`flex-1 py-2 text-lg font-semibold transition-colors ${
                isLogin ? "bg-black text-white" : "text-gray-600"
              }`}
              onClick={() => setIsLogin(true)}
              disabled={loading}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 text-lg font-semibold transition-colors ${
                !isLogin ? "bg-black text-white" : "text-gray-600"
              }`}
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
              className="w-full py-2 bg-black text-white rounded-lg font-semibold hover:bg-white hover:text-black transition-colors duration-200 hover:border-black border-2 border-transparent"
            >
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Signup'}
            </button>
          </form>
          {isLogin && (
            <div className="text-sm text-black mt-3">
              <a 
                href="#"
                onClick={handleForgotPassword}
                className="hover:underline"
              >
                Forgot Password?
              </a>
            </div>
          )}
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mt-4">{success}</p>}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;