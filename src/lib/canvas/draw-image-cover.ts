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
