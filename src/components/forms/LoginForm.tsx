'use client';

import React from 'react';
import { FormRenderer, createField } from './index';
import type { FormConfig } from './types';
import BackendAPI from '@/lib/backendApi';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectUrl?: string;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  redirectUrl = '/dashboard',
  className,
}) => {
  const formConfig: FormConfig = {
    fields: [
      createField('email', 'Email Address', 'email', {
        required: true,
        placeholder: 'user@example.com',
        helpText: 'We'll send you a magic link to sign in',
      }),
    ],
    submitButtonLabel: 'Send Magic Link',
    onSubmit: async (data) => {
      const email = data.email as string;
      if (!email) {
        throw new Error('Email is required');
      }
      await BackendAPI.signOn(email, redirectUrl);
    },
    onSuccess: () => {
      if (onSuccess) {
        onSuccess();
      }
    },
    successMessage:
      'Check your inbox for a magic link to sign in. Click the link to complete your sign-in.',
    showSuccessMessage: true,
    className,
  };

  return <FormRenderer config={formConfig} className={className} />;
};
