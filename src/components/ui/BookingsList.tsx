'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { BlockHeader } from '@/components/blocks/BlockHeader';

export interface Booking {
  idx: number;
  space: string;
  start: string;
  end: string;
  [key: string]: unknown;
}

export interface PaginationSettings {
  enabled?: boolean;
  itemsPerPage?: number;
  initialPage?: number;
  showInfo?: boolean;
  className?: string;
}

interface BookingsListProps {
  bookings: Booking[];
  loading?: boolean;
  emptyMessage?: string;
  title?: string;
  className?: string;
  pagination?: PaginationSettings | boolean;
}

export const BookingsList: React.FC<BookingsListProps> = ({
  bookings,
  loading = false,
  emptyMessage = 'No bookings yet.',
  title,
  className = '',
  pagination = true,
}) => {
  // Normalize pagination settings
  const paginationSettings: PaginationSettings =
    typeof pagination === 'boolean'
      ? {
          enabled: pagination,
          itemsPerPage: 10,
          initialPage: 1,
          showInfo: true,
        }
      : {
          enabled: pagination?.enabled ?? true,
          itemsPerPage: pagination?.itemsPerPage ?? 10,
          initialPage: pagination?.initialPage ?? 1,
          showInfo: pagination?.showInfo ?? true,
          className: pagination?.className,
        };

  const [currentPage, setCurrentPage] = useState(
    paginationSettings.initialPage ?? 1
  );

  // Calculate paginated bookings
  const paginatedBookings = useMemo(() => {
    if (!paginationSettings.enabled) {
      return bookings;
    }
    const startIndex =
      (currentPage - 1) * (paginationSettings.itemsPerPage ?? 10);
    const endIndex = startIndex + (paginationSettings.itemsPerPage ?? 10);
    return bookings.slice(startIndex, endIndex);
  }, [
    bookings,
    currentPage,
    paginationSettings.enabled,
    paginationSettings.itemsPerPage,
  ]);

  const totalPages = paginationSettings.enabled
    ? Math.ceil(bookings.length / (paginationSettings.itemsPerPage ?? 10))
    : 1;

  // Reset to initial page when bookings change
  useEffect(() => {
    setCurrentPage(paginationSettings.initialPage ?? 1);
  }, [bookings.length, paginationSettings.initialPage]);
  if (loading) {
    return (
      <div className={`bg-surface p-6 rounded-lg ${className}`}>
        <BlockHeader headline={title} />
        <p>Loading bookings...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className={`bg-surface p-6 rounded-lg ${className}`}>
        <BlockHeader headline={title} />
        <p className="text-gray-600 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`bg-surface p-6 rounded-lg ${className}`}>
      <BlockHeader headline={title} />
      <div className="space-y-2 mb-4">
        {paginatedBookings.map(booking => (
          <div key={booking.idx} className="p-4 border border-gray-300 rounded">
            <p>
              <strong>{booking.space}</strong>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(booking.start).toLocaleString()} -{' '}
              {new Date(booking.end).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      {paginationSettings.enabled && totalPages > 1 && (
        <div
          className={`flex items-center justify-between pt-4 border-t border-gray-300 ${
            paginationSettings.className || ''
          }`}
        >
          {paginationSettings.showInfo && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing{' '}
              {(currentPage - 1) * (paginationSettings.itemsPerPage ?? 10) + 1}-
              {Math.min(
                currentPage * (paginationSettings.itemsPerPage ?? 10),
                bookings.length
              )}{' '}
              of {bookings.length} bookings
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(prev => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

