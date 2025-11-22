import { FilterConfig } from '../types';

export const createDownloadablePolaroid = async (
  imageSrc: string,
  caption: string,
  filter: FilterConfig
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    // Polaroid Dimensions (Standard Squareish)
    // Outer: 88x107mm (approx ratio 1 : 1.215)
    // Image Area: 79x79mm (square)
    // We'll scale this up for good resolution.
    
    const width = 880;
    const height = 1070;
    const paddingX = 45; // Sides padding
    const paddingTop = 45; 
    const imageSize = 790; 

    canvas.width = width;
    canvas.height = height;

    // Draw Background (Paper Texture simulation)
    ctx.fillStyle = '#f8f8f8'; // Slightly off-white
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle texture/noise to paper
    // (Simplified for code size: just a solid subtle color)
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      // Draw Photo Area Background (Black backing usually visible on edges)
      ctx.fillStyle = '#101010';
      ctx.fillRect(paddingX - 2, paddingTop - 2, imageSize + 4, imageSize + 4);

      // Apply Filter
      ctx.filter = filter.cssFilter;
      
      // Draw Image (Center Crop logic)
      const aspect = img.width / img.height;
      let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;

      if (aspect > 1) {
        // Landscape source: Crop sides
        srcW = img.height;
        srcX = (img.width - img.height) / 2;
      } else {
        // Portrait source: Crop top/bottom
        srcH = img.width;
        srcY = (img.height - img.width) / 2;
      }

      ctx.drawImage(img, srcX, srcY, srcW, srcH, paddingX, paddingTop, imageSize, imageSize);
      
      // Reset Filter
      ctx.filter = 'none';

      // Draw Vignette overlay (optional, for style)
      const gradient = ctx.createRadialGradient(
        width/2, paddingTop + imageSize/2, imageSize * 0.3,
        width/2, paddingTop + imageSize/2, imageSize * 0.8
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.2)');
      ctx.fillStyle = gradient;
      ctx.fillRect(paddingX, paddingTop, imageSize, imageSize);

      // Draw Caption
      if (caption) {
        ctx.fillStyle = '#202020';
        // We use a fallback generic font because custom web fonts might not be ready on canvas immediately 
        // without FontFace API loading checks. Using a safe cursive fallback.
        ctx.font = '60px "Indie Flower", "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Bottom area center
        const bottomAreaHeight = height - (paddingTop + imageSize);
        const textY = paddingTop + imageSize + (bottomAreaHeight / 2) + 10; // Slight visual adjustment
        
        ctx.fillText(caption, width / 2, textY);
      }

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    img.onerror = (e) => reject(e);
  });
};
