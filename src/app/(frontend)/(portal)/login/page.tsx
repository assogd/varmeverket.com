'use client';

import { LoginForm } from '@/components/forms/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface p-8 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">Sign In</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Enter your email address and we&apos;ll send you a magic link to
            sign in.
          </p>

          <LoginForm redirectUrl="/dashboard" />

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              After clicking the link in your email, you&apos;ll be
              automatically signed in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
