'use client';

import React, { useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface EventBasicInfo {
  id: number;
  name: string;
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  event: EventBasicInfo | null;
  onClose: () => void;
  onConfirm: (event: EventBasicInfo) => Promise<void>;
  isDeleting: boolean;
  /** Optional error message displayed inline when deletion fails. */
  error?: string | null;
}

export function DeleteConfirmModal({
  isOpen,
  event,
  onClose,
  onConfirm,
  isDeleting,
  error,
}: DeleteConfirmModalProps) {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    cancelBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A0E1C]/65 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-desc"
        className="w-full max-w-md rounded-none bg-[#FFF3C7] p-6 sm:p-7 shadow-2xl border-2 border-[#F7418F] animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center gap-3.5 text-rose-600">
          <div className="rounded-none bg-white p-3 border border-rose-300">
            <Trash2 className="h-5 w-5 text-rose-600" />
          </div>
          <h2 id="delete-dialog-title" className="text-lg font-bold tracking-tight text-[#2A0E1C] font-headline">
            Delete Celebration?
          </h2>
        </div>

        <p id="delete-dialog-desc" className="mt-3.5 text-sm leading-relaxed text-[#2A0E1C]/80">
          Are you sure you want to delete <span className="font-bold text-[#F7418F]">&ldquo;{event.name}&rdquo;</span>?
          This will permanently remove all associated budget items, milestones, vendor checklists, and assistant conversations. This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          {error && (
            <p role="alert" className="flex-1 text-sm text-rose-600 font-medium self-center">
              {error}
            </p>
          )}
          <Button
            ref={cancelBtnRef}
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="border-[#2A0E1C]/30 text-[#2A0E1C] hover:bg-[#FEC7B4]/40"
          >
            Keep Event
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirm(event)}
            disabled={isDeleting}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}
