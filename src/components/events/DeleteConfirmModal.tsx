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
}

export function DeleteConfirmModal({
  isOpen,
  event,
  onClose,
  onConfirm,
  isDeleting,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-desc"
        className="w-full max-w-md rounded-3xl bg-[#fffdfa] p-6 sm:p-7 shadow-2xl border border-[#073330]/15 animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center gap-3.5 text-rose-600">
          <div className="rounded-2xl bg-rose-100/80 p-3 ring-4 ring-rose-50">
            <Trash2 className="h-5 w-5" />
          </div>
          <h2 id="delete-dialog-title" className="text-lg font-bold tracking-tight text-[#073330]">
            Delete Celebration?
          </h2>
        </div>

        <p id="delete-dialog-desc" className="mt-3.5 text-sm leading-relaxed text-slate-600">
          Are you sure you want to delete <span className="font-semibold text-[#073330]">&ldquo;{event.name}&rdquo;</span>?
          This will permanently remove all associated budget items, milestones, vendor checklists, and assistant conversations. This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            ref={cancelBtnRef}
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="border-[#073330]/20 text-[#073330] hover:bg-[#073330]/5"
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
