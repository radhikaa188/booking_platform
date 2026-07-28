import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { toast } from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Backend users router expects UserCreate schema: username, email, password, full_name (optional)
      const payload = {
    name: formData.full_name,
    email: formData.email,
    password: formData.password,
};

await api.post("/users/", payload);
      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
      const detail = error.response?.data?.detail;

if (Array.isArray(detail)) {
  toast.error(detail.map((e) => e.msg).join(", "));
} else {
  toast.error(detail || "Failed to create account");
}
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Eventify
            </span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-slate-900">Create your account</h2>
          <p className="mt-2 text-slate-500">Join us and start booking your favorite events.</p>
        </div>

        <Card>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                name="full_name"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
              
              <Input
                label="Email address"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Create Account
                </Button>
              </div>
            </form>

            <div className="mt-6 text-xs text-slate-500 text-center">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
