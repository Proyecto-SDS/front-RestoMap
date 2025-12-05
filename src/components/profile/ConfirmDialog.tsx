import { AlertTriangle } from 'lucide-react';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';

interface ConfirmDialogProps {
  title: string;
  message: string;
  warning?: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  title,
  message,
  warning,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isDestructive = false,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          {isDestructive && (
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-[#EF4444]/10 flex items-center justify-center">
                <AlertTriangle size={24} className="text-[#EF4444]" />
              </div>
            </div>
          )}
          <h3 className="text-[#334155] mb-2">{title}</h3>
          <p className="text-sm text-[#64748B]">{message}</p>
          {warning && (
            <div className="mt-4 p-3 bg-[#FEF3C7] rounded-lg">
              <p className="text-sm text-[#92400E]">{warning}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {isDestructive ? (
            <>
              <button
                onClick={onConfirm}
                className="flex-1 px-6 py-3 rounded-lg bg-[#EF4444] text-white hover:bg-[#DC2626] transition-colors"
              >
                {confirmText}
              </button>
              <SecondaryButton onClick={onCancel} className="flex-1">
                {cancelText}
              </SecondaryButton>
            </>
          ) : (
            <>
              <PrimaryButton onClick={onConfirm} className="flex-1">
                {confirmText}
              </PrimaryButton>
              <SecondaryButton onClick={onCancel} className="flex-1">
                {cancelText}
              </SecondaryButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
