const SAMPLE_SIZE = 120;
const MAX_PIXELS = SAMPLE_SIZE * SAMPLE_SIZE;

type RGB = [number, number,number];

export async function extractPallete(imageUrl: string, swatches = 5) : Promise<string[]> {
    const img = await loadImage(imageUrl);
    const {width, height, canvas} = drawToCanvas(img);
    const context = canvas.getContext('2d');
    if (!context) return [];

    const {data } = context.getImageData(0, 0, width, height);

    const colors : RGB[] = [];
    for ( let i = 0 ; i < data.length; i += 4 * 8) {
        //skip every 8 pixels for performance
        const r  = data[i];
        const g  = data[i + 1];
        const b  = data[i + 2];
        const brightness  = (r + g + b) / 3;

        if(brightness < 20 || brightness > 240) continue; //skip dark-ish and white-ish colors
        
        colors.push([r, g, b]);
        if (colors.length >= MAX_PIXELS / 8) break;
    }

    const buckets = new Map<string, {color: RGB, count: number}>();
    colors.forEach(([r, g, b]) => {
        const key = `${Math.floor(r / 32)}|${Math.floor(g / 32)}|${Math.floor(b / 32)}`;
        const entry = buckets.get(key);
        if(!entry){
            buckets.set(key, {color: [r, g, b], count: 1});
        } else {
            entry.count += 1;
            entry.color = [
                Math.round((entry.color[0] * (entry.count - 1) + r) / entry.count),
                Math.round((entry.color[1] * (entry.count - 1) + g) / entry.count),
                Math.round((entry.color[2] * (entry.count - 1) + b) / entry.count),
            ];
        }   
    });

    const sorted = [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, swatches)
    .map(({color}) => rgbToHex(color));

    return sorted;

}


function loadImage(src : string) { 
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = `${src}${src.includes("?") ? "&" : "?"}cacheBust=${Date.now()}`;
    });
}


function drawToCanvas(img: HTMLImageElement) {
    const canvas = document.createElement('canvas');
    const ratio = img.width / img.height;

    let width = SAMPLE_SIZE;
    let height = SAMPLE_SIZE;

    if (ratio > 1) {
        height = Math.round(SAMPLE_SIZE / ratio);
    } else {
        width = Math.round(SAMPLE_SIZE * ratio);
    }

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    context?.drawImage(img, 0, 0, width, height);
    
    return {width, height, canvas};
}

function rgbToHex([r, g, b]: RGB): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
}