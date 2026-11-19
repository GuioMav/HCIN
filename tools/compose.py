"""Builds the final report figures from the raw captures (adds borders, joins pairs, labels phone screens)."""
import os
from PIL import Image, ImageDraw, ImageFont, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, '..', 'screenshots', 'raw')
OUT = os.path.join(HERE, '..', 'screenshots')
FONT = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'


def load(n):
    return Image.open(os.path.join(RAW, n + '.png')).convert('RGB')


def border(im, w=3, col='#9A9A9A'):
    return ImageOps.expand(im, border=w, fill=col)


def side(names, h=None, gap=40):
    ims = [load(n) for n in names]
    h = h or min(i.height for i in ims)
    ims = [border(i.resize((int(i.width * h / i.height), h), Image.LANCZOS)) for i in ims]
    W = sum(i.width for i in ims) + gap * (len(ims) - 1)
    H = max(i.height for i in ims)
    out = Image.new('RGB', (W, H), 'white')
    x = 0
    for i in ims:
        out.paste(i, (x, (H - i.height) // 2))
        x += i.width + gap
    return out


def phones(items, gap=50):
    font = ImageFont.truetype(FONT, 44)
    ims = [border(load(n), 4, '#555555') for n, _ in items]
    lab = 90
    W = sum(i.width for i in ims) + gap * (len(ims) - 1)
    H = ims[0].height + lab
    out = Image.new('RGB', (W, H), 'white')
    d = ImageDraw.Draw(out)
    x = 0
    for im, (_, text) in zip(ims, items):
        out.paste(im, (x, lab))
        tw = d.textlength(text, font=font)
        d.text((x + (im.width - tw) / 2, 18), text, fill='#1A56DB', font=font)
        x += im.width + gap
    return out


def save(im, name):
    im.save(os.path.join(OUT, name + '.png'), optimize=True)


singles = ['home', 'results', 'cook_step', 'finish', 'recipe', 'constraint', 'helper', 'reviews', 'popular', 'settings']
for n in singles:
    save(border(load(n)), n)
save(side(['safety_confirm', 'safety_undo'], h=900), 'safety')
save(side(['together', 'share']), 'together_share')
save(side(['empty', 'error'], h=900), 'empty_error')
save(side(['skip', 'focus'], h=700), 'skip_focus')
save(phones([('m1_home', 'Step 1'), ('m2_results', 'Step 2'), ('m3_recipe', 'Step 3')]), 'walk_a')
save(phones([('m4_cook', 'Step 4'), ('m5_finish', 'Step 5'), ('m6_kitchen', 'Step 6')]), 'walk_b')
print('ok')
