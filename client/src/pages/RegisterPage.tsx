import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { authApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Sparkles, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await authApi.register(name, email, password);
      login(data.accessToken, data.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-10 h-10 rounded-container bg-accent flex items-center justify-center text-white mb-3 shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-semibold text-text-primary tracking-tight">Create your Knovexa account</h1>
          <p className="text-xs text-text-secondary mt-1">
            Build your personal document intelligence workspace
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-card border border-border p-6 shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-input bg-red-500/10 border border-red-500/20 text-xs text-status-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Anant Raj"
              required
            />
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
            />
            <Input
              label="Password (min 8 characters)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Get Started
            </Button>
          </form>
        </div>

        {/* Switch Link */}
        <p className="text-center text-xs text-text-secondary mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
