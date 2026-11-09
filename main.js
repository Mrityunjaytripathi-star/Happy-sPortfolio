const $ = (s) => document.querySelector(s),
  mk = (t, c) => {
    const e = document.createElement(t);
    if (c) e.className = c;
    return e;
  };
function card(d, tag) {
  const c = mk("article", "card");
  c.dataset.cat = tag;
  const th = mk("button", "th");
  th.type = "button";
  th.style.setProperty("--h", d.h);
  th.setAttribute("aria-label", "Play " + d.t);
  let v = null;
  if (d.src) {
    v = mk("video");
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = "none";
    v.src = d.src;
    th.append(v);
  }
  const ct = mk("span", "ct");
  ct.textContent = tag;
  th.append(mk("span", "pl"), ct);
  const cb = mk("div", "cb"),
    h3 = mk("h3"),
    p = mk("p"),
    vb = mk("button");
  h3.textContent = d.t;
  p.textContent = d.d;
  vb.type = "button";
  vb.textContent = "View Project";
  vb.setAttribute("aria-label", "View project: " + d.t);
  cb.append(h3, p, vb);
  c.append(th, cb);
  if (v) {
    th.onmouseenter = () => v.play().catch(() => {});
    th.onmouseleave = () => {
      v.pause();
      v.currentTime = 0;
    };
  }
  th.onclick = vb.onclick = () => openM(d);
  return c;
}
SERVICES.forEach((s) =>
  $("#sv").append(card({ t: s[0], d: s[1], src: s[2], h: s[3] }, "Service")),
);
let works = WORKS.map((w) => ({
  t: w[0],
  cat: w[1],
  d: w[2],
  src: w[3],
  h: w[4],
}));
function drawW(f = "All") {
  $("#pg").innerHTML = "";
  works
    .filter((w) => f == "All" || w.cat == f)
    .forEach((w) => $("#pg").append(card(w, w.cat)));
}
function drawF(a = "All") {
  const fl = $("#fl");
  fl.innerHTML = "";
  ["All", ...new Set(works.map((w) => w.cat))].forEach((c) => {
    const b = mk("button", c == a ? "on" : "");
    b.type = "button";
    b.textContent = c;
    b.setAttribute("aria-pressed", c == a);
    b.onclick = () => {
      setF(c);
      drawW(c);
    };
    fl.append(b);
  });
  const ad = mk("button", "add");
  ad.type = "button";
  ad.textContent = "+ Add my video";
  ad.onclick = addV;
  fl.append(ad);
}
function setF(a) {
  document.querySelectorAll("#fl button:not(.add)").forEach((b) => {
    const on = b.textContent == a;
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", on);
  });
}
/* dialogs: one helper for open/close, inert page behind, focus restore */
const BG = ["header.nav", "main", "footer", "#tp"];
let openDlg = null,
  lastFocus = null;
function showDlg(el, first) {
  lastFocus = document.activeElement;
  openDlg = el;
  BG.forEach((q) => {
    const n = $(q);
    if (n) n.inert = true;
  });
  el.classList.add("open");
  first.focus();
}
function hideDlg(el, fallback) {
  el.classList.remove("open");
  if (openDlg === el) openDlg = null;
  BG.forEach((q) => {
    const n = $(q);
    if (n) n.inert = false;
  });
  const back =
    lastFocus && document.contains(lastFocus) ? lastFocus : fallback && fallback();
  lastFocus = null;
  if (back) back.focus({ preventScroll: true });
}
function addV() {
  showDlg($("#ad"), $("#at"));
}
function closeAdd() {
  hideDlg($("#ad"), () => $("#fl .add"));
}
$("#ax").onclick = closeAdd;
$("#ad").onclick = (e) => {
  if (e.target.id == "ad") closeAdd();
};
const okUrl = (u) => {
  try {
    return /^https?:$/.test(new URL(u).protocol);
  } catch (_) {
    return false;
  }
};
$("#af").onsubmit = (e) => {
  e.preventDefault();
  const f = $("#av").files[0],
    u = $("#au").value.trim();
  if (!f && !u) {
    $("#am").textContent = "Choose a video file or paste a video link.";
    return;
  }
  if (!f && !okUrl(u)) {
    $("#am").textContent = "The link must start with http:// or https://";
    return;
  }
  works.unshift({
    t: $("#at").value.trim() || "My edit",
    cat: "Mine",
    d: "My own edited project.",
    src: f ? URL.createObjectURL(f) : u,
    h: 20,
  });
  e.target.reset();
  $("#am").textContent = "";
  drawF("Mine");
  drawW("Mine");
  closeAdd();
  $("#portfolio").scrollIntoView();
};
drawF();
drawW();
function openM(d) {
  $("#mt").textContent = d.t;
  $("#md2").textContent = d.d;
  const m = $("#mv");
  m.innerHTML = "";
  const ext = (u) => /^https?:/.test(u) && !/\.(mp4|webm|mov)(\?|$)/i.test(u);
  const fb = () => {
    m.innerHTML = "";
    const x = mk("div", "demo");
    x.style.setProperty("--h", d.h);
    const a = mk("a", "btn");
    a.href = d.src;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "Open video in new tab";
    x.append(a);
    m.append(x);
  };
  if (d.src && ext(d.src)) fb();
  else if (d.src) {
    const v = mk("video");
    v.src = d.src;
    v.controls = true;
    v.autoplay = true;
    v.playsInline = true;
    v.onerror = fb;
    m.append(v);
  } else {
    const x = mk("div", "demo");
    x.style.setProperty("--h", d.h);
    x.innerHTML =
      "<div><h3 style='font-size:28px;margin-bottom:8px'>Preview coming soon</h3><p>The full video for this project will be added here.</p></div>";
    m.append(x);
  }
  showDlg($("#md"), $("#mc"));
}
function closeM() {
  if (!$("#md").classList.contains("open")) return;
  $("#mv").innerHTML = "";
  hideDlg($("#md"));
}
$("#mc").onclick = closeM;
$("#md").onclick = (e) => {
  if (e.target.id == "md") closeM();
};
addEventListener("keydown", (e) => {
  if (e.key == "Escape") {
    if (openDlg) openDlg.id == "md" ? closeM() : closeAdd();
    else if ($("#mn").classList.contains("open")) {
      const inMenu = $("#mn").contains(document.activeElement);
      setMenu(false);
      if (inMenu) $("#bg").focus();
    }
    return;
  }
  if (e.key != "Tab" || !openDlg) return;
  /* keep Tab inside the open dialog */
  const f = [
    ...openDlg.querySelectorAll(
      "a[href],button:not([disabled]),input:not([disabled]),select,textarea,video[controls]",
    ),
  ].filter((n) => n.getClientRects().length);
  if (!f.length) return;
  const a = document.activeElement;
  if (!openDlg.contains(a) || (!e.shiftKey && a == f[f.length - 1])) {
    e.preventDefault();
    f[0].focus();
  } else if (e.shiftKey && a == f[0]) {
    e.preventDefault();
    f[f.length - 1].focus();
  }
});
$("#mf").onclick = () => {
  const e = $("#mv video") || $("#mv .demo");
  e && e.requestFullscreen && e.requestFullscreen();
};
/* skills & tools */
SKILLS.forEach((s) => {
  const d = mk("div");
  d.innerHTML = `<b><span>${s[0]}</span><span>${s[1]}%</span></b><i style="--p:${s[1]}%"></i>`;
  $("#sk").append(d);
});
TOOLS.forEach((t) => {
  const d = mk("div", "tool");
  d.innerHTML = `<u style="--c:${t[2]}">${t[1]}</u><div>${t[0]}</div>`;
  $("#tl").append(d);
});
/* hero title */
const h1w = $("#h1").textContent.trim().split(/\s+/);
$("#h1").textContent = "";
h1w.forEach((w, i) => {
  const s = mk("span");
  s.textContent = w;
  s.style.animationDelay = 1.6 + i * 0.18 + "s";
  $("#h1").append(s, document.createTextNode(" "));
});
/* nav */
function setMenu(o) {
  $("#mn").classList.toggle("open", o);
  $("#bg").setAttribute("aria-expanded", o);
}
$("#bg").onclick = () => setMenu(!$("#mn").classList.contains("open"));
$("#mn").onclick = () => setMenu(false);
/* reveal */
const io = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    }),
  { threshold: 0.15 },
);
document.querySelectorAll(".rv").forEach((e) => io.observe(e));
/* loader */
let n = 0;
const ti = setInterval(() => {
  n += Math.ceil(Math.random() * 9);
  if (n >= 100) {
    n = 100;
    clearInterval(ti);
    setTimeout(() => $("#ld").classList.add("off"), 250);
  }
  $("#ln").textContent = n;
  $("#lb").style.width = n + "%";
}, 60);
/* cursor */
const cu = $("#cu");
if (matchMedia("(hover:hover)").matches) {
  document.body.classList.add("cc");
  addEventListener("pointermove", (e) => {
    cu.style.transform = `translate(${e.clientX - 17}px,${e.clientY - 17}px)`;
    cu.classList.toggle(
      "big",
      !!e.target.closest("a,button,.th,input,select,textarea"),
    );
  });
}
/* parallax */
const hc = $("#hc");
if (!matchMedia("(prefers-reduced-motion:reduce)").matches)
  addEventListener(
    "scroll",
    () => {
      if (scrollY < innerHeight)
        hc.style.transform = `translateY(${scrollY * 0.25}px)`;
    },
    { passive: true },
  );
/* hero canvas: drifting light streaks */
const cv = $("#cv"),
  cx = cv.getContext("2d");
let W,
  H,
  P = [];
function rs() {
  W = cv.width = cv.offsetWidth;
  H = cv.height = cv.offsetHeight;
  P = Array.from({ length: Math.min(40, (W / 30) | 0) }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    l: 80 + Math.random() * 220,
    v: 0.4 + Math.random() * 1.4,
    a: 0.1 + Math.random() * 0.35,
  }));
}
rs();
addEventListener("resize", rs);
let run = true;
new IntersectionObserver((e) => (run = e[0].isIntersecting)).observe(cv);
if (!matchMedia("(prefers-reduced-motion:reduce)").matches)
  (function f() {
    if (run) {
      cx.clearRect(0, 0, W, H);
      P.forEach((p) => {
        const g = cx.createLinearGradient(p.x, 0, p.x + p.l, 0);
        g.addColorStop(0, "rgba(255,106,0,0)");
        g.addColorStop(1, `rgba(255,140,40,${p.a})`);
        cx.fillStyle = g;
        cx.fillRect(p.x, p.y, p.l, 2);
        p.x += p.v * 3;
        if (p.x > W) {
          p.x = -p.l;
          p.y = Math.random() * H;
        }
      });
    }
    requestAnimationFrame(f);
  })();
/* embers + scroll */
(() => {
  const h = $(".hero"),
    c = mk("canvas");
  c.id = "em";
  c.setAttribute("aria-hidden", "true");
  h.insertBefore(c, $("#hc"));
  const x = c.getContext("2d");
  let w,
    hh,
    E = [];
  const rz = () => {
    w = c.width = h.offsetWidth;
    hh = c.height = h.offsetHeight;
  };
  rz();
  addEventListener("resize", rz);
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  let on = true;
  new IntersectionObserver((e) => (on = e[0].isIntersecting)).observe(h);
  (function f() {
    if (on) {
      x.clearRect(0, 0, w, hh);
      if (E.length < 70 && Math.random() < 0.6)
        E.push({
          x: Math.random() * w,
          y: hh + 10,
          r: 1 + Math.random() * 2.6,
          v: 0.6 + Math.random() * 1.8,
          d: Math.random() * 6,
          a: 1,
        });
      E = E.filter((p) => p.a > 0.02);
      E.forEach((p) => {
        p.y -= p.v;
        p.x += Math.sin((p.d += 0.04)) * 0.8;
        p.a -= 0.004;
        x.beginPath();
        x.fillStyle = `rgba(255,${(120 + p.r * 30) | 0},40,${p.a})`;
        x.shadowColor = "#ff6a00";
        x.shadowBlur = 10;
        x.arc(p.x, p.y, p.r, 0, 7);
        x.fill();
      });
    }
    requestAnimationFrame(f);
  })();
})();
addEventListener(
  "scroll",
  () => {
    const s = document.documentElement,
      p = scrollY / (s.scrollHeight - innerHeight || 1);
    $("#pg2").style.width = p * 100 + "%";
    $("#tp").classList.toggle("show", scrollY > 600);
  },
  { passive: true },
);
/* contact */
$("#l-em").href = "mailto:" + CFG.email;
$("#l-em").setAttribute("aria-label", "Email: " + CFG.email);
$("#fm").onsubmit = (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const body = `Name: ${f.get("n")}\nEmail: ${f.get("e")}\nProject: ${f.get("t")}\nBudget: ${f.get("b") || "-"}\n\n${f.get("m")}`;
  location.href = `mailto:${CFG.email}?subject=${encodeURIComponent("Project enquiry: " + f.get("t"))}&body=${encodeURIComponent(body)}`;
  $("#ok").textContent =
    "Your email app is opening with the message ready to send.";
};
