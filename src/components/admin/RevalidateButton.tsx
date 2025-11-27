'use client';
import React, { useState } from 'react';

const RevalidateButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [, setMessage] = useState<string | null>(null);

  const handleRevalidate = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          '✅ Navigation revalidated! Refresh the page to see changes.'
        );
        // Force a page refresh to show the new data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage('❌ Failed to revalidate navigation');
      }
    } catch (error) {
      setMessage('❌ Error revalidating navigation');
      console.error('Revalidation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleRevalidate}
      disabled={isLoading}
      className="grow px-2 py-2.5 sm:py-1 rounded-sm hover:bg-white/10 text-bg"
    >
      {isLoading ? (
        <>
          <span>Revalidating...</span>
        </>
      ) : (
        <>
          <span>Revalidate</span>
        </>
      )}
    </button>
  );
};

export default RevalidateButton;
