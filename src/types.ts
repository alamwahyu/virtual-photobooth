export type PhotoSlotShape = "miter" | "rounded" | "oval" | "polaroid";

export type PhotoSlot = {
  x: number;
  y: number;
  width: number;
  height: number;
  shape?: PhotoSlotShape;
};

export type LayoutConfig = {
  slots: PhotoSlot[];
};

export type FrameTextType = "eventTheme" | "coupleName" | "venue" | "eventDate" | "branding" | "custom";

export type FrameText = {
  type: FrameTextType;
  enabled?: boolean;
  value?: string;
  x: number;
  y: number;
  font?: "cinzel" | "dancing" | "caveat" | "montserrat" | "serif" | "sans-serif" | string;
  fontSize: number;
  color?: string;
  align?: CanvasTextAlign;
};

export type FrameDecoration = {
  type: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  width?: number;
};

export type FrameConfig = {
  mirrorOutput?: boolean;
  texts?: FrameText[];
  decorations?: FrameDecoration[];
};

export type PublicLayout = {
  id: string;
  name: string;
  slug: string;
  description: string;
  photoCount: number;
  orientation: string;
  canvasWidth: number;
  canvasHeight: number;
  previewImage: string;
  configJson: LayoutConfig;
  isDefault?: boolean;
};

export type PublicFrame = {
  id: string;
  name: string;
  slug: string;
  layoutId: string;
  overlayImage: string;
  previewImage: string;
  backgroundColor: string;
  backgroundImage: string;
  configJson: FrameConfig;
  isDefault?: boolean;
};

export type PublicEvent = {
  id: string;
  coupleName1: string;
  coupleName2: string;
  displayName: string;
  theme: string;
  slug: string;
  eventDate: string;
  venueName: string;
  venueAddress: string;
  description: string;
  coverImage: string;
  logoImage: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  layouts: PublicLayout[];
  frames: PublicFrame[];
};

export type BoothState =
  | "IDLE"
  | "SELECTING_LAYOUT"
  | "SELECTING_FRAME"
  | "CAMERA_READY"
  | "COUNTDOWN"
  | "CAPTURING"
  | "REVIEW"
  | "COMPOSING"
  | "RESULT"
  | "ERROR";
