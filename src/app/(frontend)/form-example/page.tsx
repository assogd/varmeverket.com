'use client';

import React from 'react';
import { FormRenderer, createField } from '@/components/forms';
import type { FormConfig } from '@/components/forms';
import { Heading } from '@/components/headings';

export default function FormExamplePage() {
  const formConfig: FormConfig = {
    title: 'Complete Form Example',
    fields: [
      // Text fields
      createField('firstName', 'First Name', 'text', {
        required: true,
        placeholder: 'Enter your first name',
        helpText: 'This is a required text field',
      }),
      createField('lastName', 'Last Name', 'text', {
        required: true,
        placeholder: 'Enter your last name',
      }),

      // Email field
      createField('email', 'Email Address', 'email', {
        required: true,
        placeholder: 'your@email.com',
        helpText: "We'll use this to contact you",
      }),

      // Password field
      createField('password', 'Password', 'password', {
        required: true,
        placeholder: 'Enter a secure password',
        helpText: 'Must be at least 8 characters',
        validation: (value: unknown) => {
          if (typeof value === 'string' && value.length < 8) {
            return 'Password must be at least 8 characters';
          }
          return true;
        },
      }),

      // Telephone field
      createField('phone', 'Phone Number', 'tel', {
        placeholder: '+46 70 123 45 67',
        helpText: 'Optional phone number',
      }),

      // URL field
      createField('website', 'Website', 'url', {
        placeholder: 'https://example.com',
        helpText: 'Your personal or company website',
      }),

      // Number field
      createField('age', 'Age', 'number', {
        placeholder: '25',
        helpText: 'Your age in years',
        validation: (value: unknown) => {
          if (typeof value === 'number') {
            if (value < 0) return 'Age cannot be negative';
            if (value > 150) return 'Please enter a valid age';
          }
          return true;
        },
      }),

      // Date field (birth date)
      createField('birthDate', 'Birth Date', 'date', {
        required: true,
        helpText: 'Select your date of birth',
        minYear: 1920, // Custom year range
        maxYear: new Date().getFullYear() - 15,
      }),

      // Select field
      createField('country', 'Country', 'select', {
        required: true,
        placeholder: 'Select your country',
        options: [
          { label: 'Sweden', value: 'se' },
          { label: 'Norway', value: 'no' },
          { label: 'Denmark', value: 'dk' },
          { label: 'Finland', value: 'fi' },
          { label: 'Other', value: 'other' },
        ],
      }),

      // State/Province field
      createField('state', 'State/Province', 'state', {
        placeholder: 'Enter state or province',
      }),

      // Textarea field
      createField('message', 'Message', 'textarea', {
        required: true,
        placeholder: 'Tell us about yourself...',
        helpText: 'Please provide some information about yourself',
      }),

      // Checkbox fields
      createField('newsletter', 'Subscribe to newsletter', 'checkbox', {
        defaultValue: false,
        helpText: 'Receive updates and news via email',
      }),
      createField('terms', 'I agree to the terms and conditions', 'checkbox', {
        required: true,
        defaultValue: false,
        helpText: 'You must agree to continue',
      }),
    ],
    submitButtonLabel: 'Submit Form',
    onSubmit: async data => {
      // Submit to API endpoint
      const response = await fetch('/api/form-example', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.message || 'Failed to submit form. Please try again.'
        );
      }

      return response.json();
    },
    successMessage:
      'Thank you! Your form has been submitted successfully. We will get back to you soon.',
    showSuccessMessage: true,
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="">
        <div className="mb-8 text-center">
          <Heading variant="section" as="h1" className="mb-4">
            Form Example Page
          </Heading>
          <p className="font-mono text-sm">
            This page demonstrates all available form field types in the form
            renderer system. All fields are fully functional and include
            validation.
          </p>
        </div>

        <div className="p-8">
          <FormRenderer config={formConfig} />
        </div>

        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Field Types Demonstrated:</h2>
          <ul className="list-disc list-inside space-y-2 font-mono text-sm">
            <li>Text (First Name, Last Name)</li>
            <li>Email (with email validation)</li>
            <li>Password (with custom length validation)</li>
            <li>Tel (Phone Number)</li>
            <li>URL (Website)</li>
            <li>Number (Age with range validation)</li>
            <li>Select (Country dropdown)</li>
            <li>State/Province</li>
            <li>Textarea (Message)</li>
            <li>Checkbox (Newsletter, Terms)</li>
          </ul>
        </div>

        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-lg font-bold mb-2">Code Example:</h3>
          <pre className="font-mono text-xs overflow-x-auto bg-bg p-4 rounded border border-text">
            <code>{`import { FormRenderer, createField } from '@/components/forms';

const formConfig = {
  fields: [
    createField('email', 'Email', 'email', { required: true }),
    createField('message', 'Message', 'textarea', { required: true }),
    createField('agree', 'I agree', 'checkbox', { required: true }),
  ],
  onSubmit: async (data) => {
    await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

<FormRenderer config={formConfig} />`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
