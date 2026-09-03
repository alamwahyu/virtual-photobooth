"use client";

export function PhotoPreview({ photos, retaking, onRetake }: { photos: string[]; retaking: boolean; onRetake: (index: number) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {photos.map((photo, index) => (
        <div key={index} className="min-w-0 rounded-lg border border-black/10 bg-white p-2 shadow-soft">
          <img src={photo} alt={`Pose ${index + 1}`} className="aspect-[4/3] w-full rounded-md object-cover" />
          <div className="mt-2 grid gap-2 sm:flex sm:items-center sm:justify-between">
            <span className="text-sm font-medium">Pose {index + 1}</span>
            <button type="button" disabled={retaking} onClick={() => onRetake(index)} className="touch-target inline-flex items-center justify-center rounded-md border px-3 text-sm hover:bg-linen disabled:opacity-50">
              Retake
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
