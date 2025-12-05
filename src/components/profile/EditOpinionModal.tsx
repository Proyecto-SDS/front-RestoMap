import { Star, X } from 'lucide-react';
import { useState } from 'react';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { OpinionData } from './OpinionCard';

interface EditOpinionModalProps {
  opinion: OpinionData;
  onClose: () => void;
  onSave: (id: string, rating: number, comment: string) => void;
}

export function EditOpinionModal({
  opinion,
  onClose,
  onSave,
}: EditOpinionModalProps) {
  const [rating, setRating] = useState(opinion.puntuacion);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(opinion.comentario);
  const [isLoading, setIsLoading] = useState(false);

  const maxChars = 500;
  const remainingChars = maxChars - comment.length;

  const handleSave = async () => {
    if (rating === 0 || comment.trim() === '') return;

    setIsLoading(true);
    await onSave(opinion.id, rating, comment);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E2E8F0] p-6 flex items-center justify-between">
          <h2 className="text-[#334155]">Editar opinión</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X size={24} className="text-[#64748B]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Establishment Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <ImageWithFallback
                src={opinion.establishment.image}
                alt={opinion.establishment.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-[#334155] mb-1">
                {opinion.establishment.name}
              </h3>
              <span className="text-xs px-2 py-1 rounded bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white">
                {opinion.establishment.type}
              </span>
            </div>
          </div>

          {/* Rating Selector */}
          <div className="mb-6">
            <label className="block text-sm text-[#334155] mb-2">
              Calificación
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                  type="button"
                >
                  <Star
                    size={32}
                    className={
                      star <= (hoveredRating || rating)
                        ? 'fill-[#F97316] text-[#F97316]'
                        : 'text-[#E2E8F0]'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment Text Area */}
          <div className="mb-6">
            <label className="block text-sm text-[#334155] mb-2">
              Tu opinión
            </label>
            <textarea
              value={comment}
              onChange={(e) => {
                if (e.target.value.length <= maxChars) {
                  setComment(e.target.value);
                }
              }}
              placeholder="Comparte tu experiencia..."
              className="w-full h-32 px-4 py-3 border-2 border-[#E2E8F0] rounded-lg focus:border-[#F97316] focus:outline-none resize-none text-[#334155]"
              maxLength={maxChars}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-[#94A3B8]">
                Máximo {maxChars} caracteres
              </p>
              <p
                className={`text-xs ${
                  remainingChars < 50 ? 'text-[#EF4444]' : 'text-[#94A3B8]'
                }`}
              >
                {remainingChars} caracteres restantes
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <PrimaryButton
              onClick={handleSave}
              disabled={rating === 0 || comment.trim() === '' || isLoading}
              isLoading={isLoading}
              className="flex-1"
            >
              Guardar cambios
            </PrimaryButton>
            <SecondaryButton onClick={onClose} className="flex-1">
              Cancelar
            </SecondaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
