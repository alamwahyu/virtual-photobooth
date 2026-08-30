export type CoverRect = {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
  destinationX: number;
  destinationY: number;
  destinationWidth: number;
  destinationHeight: number;
};

export type ContainRect = {
  destinationX: number;
  destinationY: number;
  destinationWidth: number;
  destinationHeight: number;
};

export function calculateImageCover(sourceWidth: number, sourceHeight: number, destinationWidth: number, destinationHeight: number): CoverRect {
  const sourceRatio = sourceWidth / sourceHeight;
  const destinationRatio = destinationWidth / destinationHeight;
  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;
  let sourceX = 0;
  let sourceY = 0;

  if (sourceRatio > destinationRatio) {
    cropWidth = sourceHeight * destinationRatio;
    sourceX = (sourceWidth - cropWidth) / 2;
  } else {
    cropHeight = sourceWidth / destinationRatio;
    sourceY = (sourceHeight - cropHeight) / 2;
  }

  return {
    sourceX,
    sourceY,
    sourceWidth: cropWidth,
    sourceHeight: cropHeight,
    destinationX: 0,
    destinationY: 0,
    destinationWidth,
    destinationHeight
  };
}

export function calculateImageContain(sourceWidth: number, sourceHeight: number, destinationWidth: number, destinationHeight: number): ContainRect {
  const scale = Math.min(destinationWidth / sourceWidth, destinationHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;

  return {
    destinationX: (destinationWidth - width) / 2,
    destinationY: (destinationHeight - height) / 2,
    destinationWidth: width,
    destinationHeight: height
  };
}

export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource & { width?: number; height?: number; videoWidth?: number; videoHeight?: number; naturalWidth?: number; naturalHeight?: number },
  x: number,
  y: number,
  width: number,
  height: number
) {
  const sourceWidth = image.videoWidth || image.naturalWidth || image.width || width;
  const sourceHeight = image.videoHeight || image.naturalHeight || image.height || height;
  const rect = calculateImageCover(sourceWidth, sourceHeight, width, height);
  ctx.drawImage(image, rect.sourceX, rect.sourceY, rect.sourceWidth, rect.sourceHeight, x, y, width, height);
  return rect;
}

export function drawImageContain(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource & { width?: number; height?: number; videoWidth?: number; videoHeight?: number; naturalWidth?: number; naturalHeight?: number },
  x: number,
  y: number,
  width: number,
  height: number
) {
  const sourceWidth = image.videoWidth || image.naturalWidth || image.width || width;
  const sourceHeight = image.videoHeight || image.naturalHeight || image.height || height;
  const rect = calculateImageContain(sourceWidth, sourceHeight, width, height);
  ctx.drawImage(image, x + rect.destinationX, y + rect.destinationY, rect.destinationWidth, rect.destinationHeight);
  return rect;
}
