# Form Renderer System

A flexible, reusable form rendering system that works with both CMS forms (from Payload Form Builder) and programmatic forms defined in code.

## Features

- ✅ Works with CMS forms from Payload Form Builder
- ✅ Create forms programmatically without CMS data
- ✅ Built-in validation (required, email, custom)
- ✅ Multiple field types (text, email, password, textarea, select, checkbox, number, etc.)
- ✅ Error handling and display
- ✅ Success/error messages
- ✅ Loading states
- ✅ Customizable styling
- ✅ TypeScript support

## Quick Start

### Using CMS Forms

CMS forms are automatically rendered when you add a Form block to a page. The `FormBlock` component handles everything.

### Creating Programmatic Forms

```tsx
import { FormRenderer, createField } from '@/components/forms';
import type { FormConfig } from '@/components/forms';

const myFormConfig: FormConfig = {
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
    createField('message', 'Message', 'textarea', {
      required: true,
      placeholder: 'Your message...',
    }),
  ],
  submitButtonLabel: 'Send Message',
  onSubmit: async (data) => {
    // Your submission logic
    await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  successMessage: 'Thank you! We'll get back to you soon.',
};

export function MyForm() {
  return <FormRenderer config={myFormConfig} />;
}
```

## Field Types

- `text` - Text input
- `email` - Email input with validation
- `password` - Password input
- `textarea` - Multi-line text input
- `select` - Dropdown select
- `checkbox` - Checkbox
- `number` - Number input
- `tel` - Telephone input
- `url` - URL input
- `state` - State/Province input
- `country` - Country input

## Field Options

```tsx
createField('fieldName', 'Field Label', 'text', {
  required: true, // Make field required
  placeholder: 'Enter text...', // Placeholder text
  defaultValue: 'Default value', // Default value
  helpText: 'Helpful hint text', // Help text below field
  validation: value => {
    // Custom validation
    if (value.length < 5) {
      return 'Must be at least 5 characters';
    }
    return true;
  },
  options: [
    // For select fields
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
  ],
});
```

## Form Configuration

```tsx
interface FormConfig {
  id?: string; // For CMS forms
  title?: string; // Form title
  fields: FormField[]; // Array of form fields
  submitButtonLabel?: string; // Submit button text
  onSubmit?: (data) => Promise<void>; // Submission handler
  onSuccess?: (data) => void; // Success callback
  onError?: (error: Error) => void; // Error callback
  showSuccessMessage?: boolean; // Show success message (default: true)
  successMessage?: string; // Custom success message
  className?: string; // Additional CSS classes
}
```

## Pre-built Forms

### LoginForm

A ready-to-use login form component:

```tsx
import { LoginForm } from '@/components/forms/LoginForm';

<LoginForm
  redirectUrl="/dashboard"
  onSuccess={() => console.log('Login successful!')}
/>;
```

## Examples

See `src/components/forms/examples.tsx` for complete examples including:

- Contact form
- Registration form
- Feedback form

## Validation

The form system includes built-in validation:

- **Required fields**: Automatically validated
- **Email fields**: Email format validation
- **Custom validation**: Use the `validation` function on any field

```tsx
createField('password', 'Password', 'password', {
  required: true,
  validation: value => {
    if (typeof value === 'string' && value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    return true;
  },
});
```

## Styling

Forms use your existing design system classes. All inputs follow the same styling pattern:

- Font: `font-mono`
- Border: `border-text`
- Background: `bg-bg`
- Text: `text-text`

You can override styling by passing a `className` prop to `FormRenderer`.
