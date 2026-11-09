# Source files
The same website split into separate files, for easy editing. After any change run `python3 build_single.py` here; it rewrites `../index.html`.

```
source/
├── index.html        page structure (profile photo is embedded as base64)
├── css/style.css     all design and animations
├── js/data.js        EDIT HERE: email, services, portfolio videos, skills, tools
├── js/main.js        all behaviour (loader, filters, dialogs, embers, form)
├── assets/images/profile.jpg   the cropped profile photo (reference copy)
├── assets/videos/    put your .mp4 files here (see README in the parent folder)
├── tools/make_status_video.py  WhatsApp status video maker (run from inside tools/)
└── build_single.py   merges everything into ../index.html
```
