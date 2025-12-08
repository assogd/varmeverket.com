/**
 * Example form configurations
 * These demonstrate how to create forms programmatically
 */

import { createField, FormRenderer } from './index';
import type { FormConfig } from './types';

/**
 * Example: Contact form
 */
export const contactFormConfig: FormConfig = {
  title: 'Contact Us',
  fields: [
    createField('name', 'Name', 'text', {
      required: true,
      placeholder: 'Your name',
    }),
    createField('email', 'Email', 'email', {
      required: true,
      placeholder: 'your@email.com',
    }),
    createField('subject', 'Subject', 'text', {
      required: true,
      placeholder: 'What is this about?',
    }),
    createField('message', 'Message', 'textarea', {
      required: true,
      placeholder: 'Your message...',
    }),
  ],
  submitButtonLabel: 'Send Message',
  onSubmit: async (data) => {
    // Your submission logic here
    console.log('Contact form submitted:', data);
    // await fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) });
  },
  successMessage: 'Thank you! We'll get back to you soon.',
};

/**
 * Example: Registration form
 */
export const registrationFormConfig: FormConfig = {
  title: 'Create Account',
  fields: [
    createField('firstName', 'First Name', 'text', {
      required: true,
    }),
    createField('lastName', 'Last Name', 'text', {
      required: true,
    }),
    createField('email', 'Email', 'email', {
      required: true,
      placeholder: 'you@example.com',
    }),
    createField('password', 'Password', 'password', {
      required: true,
      helpText: 'Must be at least 8 characters',
      validation: (value) => {
        if (typeof value === 'string' && value.length < 8) {
          return 'Password must be at least 8 characters';
        }
        return true;
      },
    }),
    createField('agreeToTerms', 'I agree to the terms and conditions', 'checkbox', {
      required: true,
    }),
  ],
  submitButtonLabel: 'Create Account',
  onSubmit: async (data) => {
    console.log('Registration form submitted:', data);
    // await fetch('/api/register', { method: 'POST', body: JSON.stringify(data) });
  },
};

/**
 * Example: Feedback form with select
 */
export const feedbackFormConfig: FormConfig = {
  title: 'Share Your Feedback',
  fields: [
    createField('category', 'Category', 'select', {
      required: true,
      options: [
        { label: 'Bug Report', value: 'bug' },
        { label: 'Feature Request', value: 'feature' },
        { label: 'General Feedback', value: 'general' },
      ],
    }),
    createField('rating', 'Rating', 'select', {
      required: true,
      options: [
        { label: 'Excellent', value: '5' },
        { label: 'Good', value: '4' },
        { label: 'Average', value: '3' },
        { label: 'Poor', value: '2' },
        { label: 'Very Poor', value: '1' },
      ],
    }),
    createField('comments', 'Comments', 'textarea', {
      placeholder: 'Tell us more...',
    }),
  ],
  submitButtonLabel: 'Submit Feedback',
  onSubmit: async (data) => {
    console.log('Feedback form submitted:', data);
  },
};

/**
 * Usage example component
 */
export function ExampleForms() {
  return (
    <div className="space-y-12 p-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Contact Form</h2>
        <FormRenderer config={contactFormConfig} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Registration Form</h2>
        <FormRenderer config={registrationFormConfig} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Feedback Form</h2>
        <FormRenderer config={feedbackFormConfig} />
      </div>
    </div>
  );
}
