# We Are History — Marie Van Brittan Brown (review package)

These files are review-ready only. Nothing has been published, scheduled or uploaded.

| Deliverable | Path |
|---|---|
| 4:5 carousel stills (1080×1350) | `carousel-4x5/slide-01.png` … `slide-07.png` |
| 4:5 animated slides (MP4, 7–8 s each) | `carousel-4x5/mp4/slide-01.mp4` … `slide-07.mp4` |
| 9:16 stills (1080×1920) | `reel-9x16/slide-01.png` … `slide-07.png` |
| 9:16 per-slide MP4s | `reel-9x16/mp4/slide-01.mp4` … `slide-07.mp4` |
| 9:16 Reels/TikTok cut (50.4 s, silent audio track) | `reel-9x16/marie-van-brittan-brown-reel-9x16.mp4` |
| Contact sheets | `contact-sheet-4x5.png`, `contact-sheet-9x16.png` |
| Source record (claim → source) | `SOURCE-RECORD.md` |
| Alt text + archival/reconstruction disclosure | `ALT-TEXT-AND-DISCLOSURE.md` |
| Instagram and Facebook captions | `CAPTIONS.md` |

## Editing

All text is live HTML in `build/carousel.html`; no headline or body copy is baked into an image. To re-render:

```
cd build
NODE_PATH=$(npm root -g) node render.js stills both       # PNGs
NODE_PATH=$(npm root -g) node render.js video both 3,4    # MP4s for chosen slides
```

Patent figures are alpha masks cropped from the USPTO PDF (`build/assets/*.png`), so they can be recoloured.

## 9:16 safe zones

Content sits between y=220 and y≈1520. The top ~220 px and bottom ~400 px are left clear for platform UI.
