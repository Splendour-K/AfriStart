import { useState, type ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AvatarPreviewProps {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  fallback?: ReactNode;
  disabled?: boolean;
}

export const AvatarPreview = ({
  src,
  name,
  size = 48,
  className,
  fallback,
  disabled,
}: AvatarPreviewProps) => {
  const [open, setOpen] = useState(false);
  const hasImage = !!src && !disabled;

  const dimensionStyles: React.CSSProperties = {
    width: size,
    height: size,
  };

  const handleOpen = () => {
    if (hasImage) {
      setOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={!hasImage}
        className={cn(
          "rounded-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed",
          hasImage ? "ring-offset-background" : "",
          className
        )}
        style={dimensionStyles}
        aria-label={hasImage ? "View full profile photo" : undefined}
      >
        {hasImage ? (
          <img src={src!} alt={name ?? "Profile photo"} className="w-full h-full object-cover" />
        ) : (
          fallback
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border-none bg-transparent shadow-none p-0">
          {src && (
            <img
              src={src}
              alt={name ?? "Profile photo"}
              className="w-full max-h-[80vh] rounded-2xl object-cover"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
