import sys, glob
from PIL import Image, ImageDraw
fs = sys.argv[2:]
ims = [Image.open(f).convert('RGB').resize((360, 640)) for f in fs]
n = len(ims); cols = min(4, n); rows = (n + cols - 1) // cols
sheet = Image.new('RGB', (cols * 365, rows * 670), (60, 60, 60))
d = ImageDraw.Draw(sheet)
for i, (im, f) in enumerate(zip(ims, fs)):
    x, y = (i % cols) * 365, (i // cols) * 670
    sheet.paste(im, (x, y + 25)); d.text((x + 5, y + 5), f.split('_')[-1], fill=(255, 255, 0))
sheet.save(sys.argv[1])
