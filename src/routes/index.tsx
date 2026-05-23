import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties } from "react";

export const Route = createFileRoute("/")({ component: Index });

// ---------- Stickers ----------
const STICKERS = [
  "/assets/sticker-heart.png",
  "/assets/sticker-lips.png",
  "/assets/sticker-monkey1.png",
  "/assets/sticker-monkey2.png",
  "/assets/sticker-monkey3.png",
  "/assets/sticker-monkey4.png",
  "/assets/sticker-monkey5.png",
  "/assets/news-heart.png",
];

type StickerProps = { src?: string; top: string; left: string; size: number; rot: number; delay?: number; z?: number };
function Sticker({ src, top, left, size, rot, delay = 0, z = 5 }: StickerProps) {
  const s = src ?? STICKERS[Math.floor(Math.random() * STICKERS.length)];
  const style = { top, left, width: size, "--r": `${rot}deg`, animationDelay: `${delay}s`, zIndex: z } as CSSProperties;
  return (
    <img
      src={s}
      alt=""
      aria-hidden
      className="absolute floaty pointer-events-none select-none drop-shadow-xl"
      style={style}
    />
  );
}

function StickerField({ items }: { items: StickerProps[] }) {
  return (
    <>
      {items.map((it, i) => (
        <Sticker key={i} {...it} />
      ))}
    </>
  );
}

// ---------- Torn divider ----------
function Torn({ color = "#FFF8F0", flip = false }: { color?: string; flip?: boolean }) {
  return (
    <div
      className="torn-top w-full h-8 relative -mt-1 -mb-1"
      style={{ background: color, transform: flip ? "scaleY(-1)" : undefined }}
    />
  );
}

// ---------- Intro Video ----------
function Intro({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);
  const finish = () => {
    setFading(true);
    setTimeout(onDone, 800);
  };
  return (
    <div className={`fixed inset-0 z-[100] bg-black transition-opacity duration-700 ${fading ? "opacity-0" : "opacity-100"}`}>
      <video
        src="/assets/intro.mp4"
        autoPlay
        playsInline
        className="w-full h-full object-cover"
        onEnded={finish}
        onError={finish}
      />
      <button
        onClick={finish}
        className="absolute bottom-5 right-5 text-white/80 hover:text-white text-sm bg-white/10 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-full"
        style={{ fontFamily: "var(--font-type)" }}
      >
        saltar →
      </button>
    </div>
  );
}

// ---------- Lyric pieces ----------
const VERSE1 = `Tú no ere' real, tú caíste 'el cielo
Pa' mí sale el sol siempre que te veo
Vamo' a encerrarno', mis plane' cancelo
Que estoy pa' driftear por tu cuerpo entero
Te llevo pa' casa, te presento a abuelo
Pa' que te haga jugo, que ella hablé primero
Estar sin tus besos, eso sí da miedo`;

const VERSE1_END = `(Quiero, quiero, quiero, quiero, quiero, quiero)
Sí, eso es lo que quiero (Quiero, quiero, quiero, quiero, quiero, quiero)
Ah, sabes que es verdad
Ponte de ladito, quédate sin na'
Dile a todito' que ese es mi lunar
Y es que en tus labio' es que yo quiero estar
Ese es mi lugar`;

const VERSE2 = `En los días oscuro' tu lunita estuvo, a tu la'o seguro me sentía yo
Viviendo una peli teniendo tu amor
Un atardecer que me quitó el dolor`;

const VERSE2_END = `Tú dijiste: "No, yo me quedo aquí"
Por eso en mi cora siempre estás ahí, siempre estás ahí, bebé`;

// ---------- Polaroid ----------
function Polaroid({ src, label, rot, w = 280 }: { src: string; label: string; rot: number; w?: number }) {
  return (
    <div className="polaroid mx-auto my-12" style={{ transform: `rotate(${rot}deg)`, width: w }}>
      <div style={{ width: "100%", aspectRatio: "4/5", background: "#eee", overflow: "hidden" }}>
        <img
          src={src}
          alt={label}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/assets/sticker-monkey3.png";
            (e.currentTarget as HTMLImageElement).style.objectFit = "contain";
            (e.currentTarget as HTMLImageElement).style.background = "#F2B5C5";
          }}
        />
      </div>
      <p className="text-center mt-3 text-2xl" style={{ fontFamily: "var(--font-hand)" }}>{label}</p>
    </div>
  );
}

// ---------- Main ----------
function Index() {
  const [showIntro, setShowIntro] = useState(true);
  const [muted, setMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastInteract = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const resumeScrollTopRef = useRef(0);
  const resumeTimestampRef = useRef(0);
  const lastAutoScrollTopRef = useRef<number | null>(null);

  useEffect(() => {
    if (showIntro || muted) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, [showIntro, muted]);

  // Slow auto scroll that resumes from the user's manual position
  useEffect(() => {
    if (showIntro) return;
    const AUTO_SCROLL_DURATION = 520;

    const captureResumePoint = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
      resumeScrollTopRef.current = Math.min(window.scrollY, max);
      resumeTimestampRef.current = performance.now();
    };

    captureResumePoint();

    const onInteract = () => {
      lastInteract.current = Date.now();
    };
    const onScroll = () => {
      const lastAutoTop = lastAutoScrollTopRef.current;
      if (lastAutoTop !== null && Math.abs(window.scrollY - lastAutoTop) < 2) {
        lastAutoScrollTopRef.current = null;
        return;
      }

      lastInteract.current = Date.now();
      captureResumePoint();
    };

    window.addEventListener("wheel", onInteract, { passive: true });
    window.addEventListener("touchstart", onInteract, { passive: true });
    window.addEventListener("touchmove", onInteract, { passive: true });
    window.addEventListener("mousedown", onInteract);
    window.addEventListener("keydown", onInteract);
    window.addEventListener("scroll", onScroll, { passive: true });

    const loop = () => {
      const idleFor = Date.now() - lastInteract.current;
      if (lastInteract.current === 0 || idleFor > 3000) {
        const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
        const anchorScrollTop = Math.min(resumeScrollTopRef.current, max);
        const elapsedSinceAnchor = Math.max(
          (performance.now() - resumeTimestampRef.current) / 1000,
          0,
        );
        const scrollSpeed = max > 0 ? max / AUTO_SCROLL_DURATION : 0;
        const targetTop = Math.min(anchorScrollTop + scrollSpeed * elapsedSinceAnchor, max);

        lastAutoScrollTopRef.current = targetTop;
        window.scrollTo({ top: targetTop, behavior: "auto" });
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("wheel", onInteract);
      window.removeEventListener("touchstart", onInteract);
      window.removeEventListener("touchmove", onInteract);
      window.removeEventListener("mousedown", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("scroll", onScroll);
    };
  }, [showIntro]);

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    if (muted) {
      a.muted = false;
      setMuted(false);
    } else {
      a.muted = true;
      setMuted(true);
    }
  };

  return (
    <div className="paper paper-grain relative overflow-x-hidden">
      {showIntro && <Intro onDone={() => setShowIntro(false)} />}

      <audio ref={audioRef} src="/assets/song.mp3" muted loop={false} preload="auto" />

      {/* Unmute floating button */}
      <button
        onClick={toggleMute}
        aria-label={muted ? "play music" : "mute"}
        className="fixed bottom-5 right-5 z-[90] w-16 h-16 hover:scale-110 transition-transform"
        style={{
          background: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23C0192C' stroke='%231A1A1A' stroke-width='1.2' d='M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z'/></svg>") center/contain no-repeat`,
        }}
      >
        <span className="text-white text-xs font-bold" style={{ fontFamily: "var(--font-type)" }}>
          {muted ? "play ♪" : "mute"}
        </span>
      </button>

      {/* ============ SECTION 2: HERO ============ */}
      <section className="relative min-h-screen w-full flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
        <StickerField
          items={[
            { src: "/assets/sticker-heart.png", top: "8%", left: "6%", size: 110, rot: -12, delay: 0 },
            { src: "/assets/sticker-lips.png", top: "12%", left: "82%", size: 90, rot: 14, delay: 1 },
            { src: "/assets/sticker-monkey1.png", top: "70%", left: "4%", size: 130, rot: -8, delay: 2 },
            { src: "/assets/sticker-monkey3.png", top: "75%", left: "78%", size: 150, rot: 10, delay: 0.5 },
            { src: "/assets/news-heart.png", top: "45%", left: "88%", size: 100, rot: 18, delay: 1.5 },
          ]}
        />

        {/* Vinyl */}
        <div className="absolute top-8 right-8 w-20 h-20 rounded-full spin-slow shadow-2xl"
          style={{ background: "radial-gradient(circle, #C0192C 0 18%, #1A1A1A 18% 100%)" }}>
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <div className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream" style={{ background: "#FFF8F0" }} />
        </div>

        <div className="relative z-10 text-center max-w-5xl">
          <h1 className="leading-[0.85]">
            <span className="block text-[18vw] md:text-[14rem] font-black tracking-tight" style={{ fontFamily: "var(--font-news)" }}>
              QUÉDATE
            </span>
            <span className="inline-block -mt-6 text-[10vw] md:text-8xl italic" style={{ fontFamily: "var(--font-hand)", color: "#C0192C", transform: "rotate(-6deg)" }}>
              un rato
            </span>
            <span className="inline-block ml-3 text-[7vw] md:text-6xl" style={{ fontFamily: "var(--font-type)" }}>
              más ♥
            </span>
          </h1>
          <p className="mt-10 text-4xl md:text-5xl" style={{ fontFamily: "var(--font-scrawl)", color: "#C0192C" }}>
            para ti, con todo
          </p>
          <p className="mt-4 text-sm tracking-widest opacity-60" style={{ fontFamily: "var(--font-type)" }}>
            ↓ Activa la música con el corazón ↓
          </p>
        </div>
      </section>

      <Torn color="#C0192C" />

      {/* ============ NA NA WAVE ============ */}
      <section className="relative py-24 overflow-hidden" style={{ background: "#C0192C", color: "#FFF8F0" }}>
        <StickerField items={[
          { src: "/assets/sticker-heart.png", top: "20%", left: "10%", size: 80, rot: -10 },
          { src: "/assets/sticker-monkey2.png", top: "60%", left: "75%", size: 140, rot: 12, delay: 1 },
        ]} />
        {[0, 1, 2].map((i) => (
          <div key={i} className="whitespace-nowrap wave-x text-7xl md:text-9xl italic" style={{ fontFamily: "var(--font-hand)", animationDelay: `${i * -4.5}s` }}>
            Na-na-na-na ♪ &nbsp; Na-na-na-na ♪ &nbsp; Na-na-na-na ♪ &nbsp;
          </div>
        ))}
      </section>

      <Torn color="#FFF8F0" />

      {/* ============ VERSE 1 ============ */}
      <section className="relative py-24 px-6">
        <StickerField items={[
          { src: "/assets/sticker-lips.png", top: "5%", left: "85%", size: 110, rot: 18 },
          { src: "/assets/sticker-monkey4.png", top: "75%", left: "2%", size: 130, rot: -14, delay: 1.5 },
          { src: "/assets/news-heart.png", top: "50%", left: "90%", size: 90, rot: -8, delay: 1 },
        ]} />
        <div className="scrap max-w-2xl mx-auto" style={{ transform: "rotate(-2deg)" }}>
          <span className="absolute top-4 left-4 text-xs tracking-widest" style={{ fontFamily: "var(--font-type)", color: "#C0192C", border: "2px solid #C0192C", padding: "4px 10px" }}>
            VERSO I
          </span>
          <div className="tape" />
          <p className="mt-8 text-2xl md:text-3xl whitespace-pre-line leading-relaxed" style={{ fontFamily: "var(--font-type)" }}>
            {VERSE1}
          </p>
          <p className="mt-4 text-3xl md:text-4xl" style={{ fontFamily: "var(--font-hand)" }}>
            <span className="pink-hl text-4xl md:text-5xl">Tus ojitos chinos</span>, mami, siempre quiero
          </p>
          <p className="mt-4 text-xl md:text-2xl whitespace-pre-line leading-relaxed" style={{ fontFamily: "var(--font-type)" }}>
            {VERSE1_END}
          </p>
        </div>

        <Polaroid src="/assets/couple1.jpg" label="nosotros 🤍" rot={3} />
      </section>

      <Torn color="#C0192C" />

      {/* ============ CHORUS 1 ============ */}
      <section className="relative py-24 px-6" style={{ background: "#C0192C" }}>
        <StickerField items={[
          { src: "/assets/sticker-heart.png", top: "10%", left: "8%", size: 100, rot: -16 },
          { src: "/assets/sticker-monkey5.png", top: "65%", left: "80%", size: 150, rot: 10, delay: 1 },
        ]} />
        <div className="scrap scrap-red max-w-2xl mx-auto" style={{ transform: "rotate(1.5deg)" }}>
          <h2 className="text-6xl md:text-7xl font-black mb-6" style={{ fontFamily: "var(--font-news)", color: "#1A1A1A" }}>
            CORO ♥
          </h2>
          <div className="text-2xl md:text-3xl leading-relaxed" style={{ fontFamily: "var(--font-hand)" }}>
            <p><span className="ink-underline" style={{ background: "linear-gradient(transparent 70%, #1A1A1A 70%, #1A1A1A 85%, transparent 85%)" }}>Quédate</span> un rato má'</p>
            <p>Te vo'a cuidar como un <span className="ink-strike">bodyguard</span></p>
            <p>Un ratito má'</p>
            <p>Siempre quiero un ratito, un ratito má'</p>
            <p className="mt-3"><span className="ink-underline" style={{ background: "linear-gradient(transparent 70%, #1A1A1A 70%, #1A1A1A 85%, transparent 85%)" }}>Quédate</span> un rato má'</p>
            <p>Te vo'a cuidar como un <span className="ink-strike">bodyguard</span></p>
            <p>Un ratito má'</p>
            <p>Siempre quiero un ratito, un ratito má'</p>
          </div>
        </div>
      </section>

      <Torn color="#FFF8F0" />

      {/* ============ HER PHOTOS ============ */}
      <section className="relative py-20 px-6">
        <StickerField items={[
          { src: "/assets/sticker-lips.png", top: "8%", left: "12%", size: 90, rot: -10 },
          { src: "/assets/sticker-heart.png", top: "60%", left: "85%", size: 110, rot: 18 },
        ]} />
        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <Polaroid src="/assets/her1.jpg" label="ella ✨" rot={-2} />
          <Polaroid src="/assets/her2.jpg" label="mi todo 💘" rot={4} />
        </div>
      </section>

      <Torn color="#C0192C" />

      {/* ============ INSTRUMENTAL ============ */}
      <section className="relative h-[60vh] overflow-hidden" style={{ background: "#C0192C" }}>
        {Array.from({ length: 24 }).map((_, i) => {
          const notes = ["♪", "♫", "♩", "♬"];
          return (
            <span
              key={i}
              className="absolute text-cream wave-x"
              style={{
                color: "#FFF8F0",
                top: `${(i * 37) % 90}%`,
                fontSize: `${30 + (i % 5) * 18}px`,
                fontFamily: "serif",
                animationDelay: `${(i * -0.8)}s`,
                animationDuration: `${10 + (i % 6) * 2}s`,
                opacity: 0.85,
              }}
            >
              {notes[i % 4]}
            </span>
          );
        })}
      </section>

      <Torn color="#FFF8F0" />

      {/* ============ VERSE 2 ============ */}
      <section className="relative py-24 px-6">
        <StickerField items={[
          { src: "/assets/sticker-monkey1.png", top: "10%", left: "80%", size: 120, rot: 14 },
          { src: "/assets/news-heart.png", top: "70%", left: "5%", size: 100, rot: -12, delay: 1 },
        ]} />
        <div className="scrap max-w-2xl mx-auto" style={{ transform: "rotate(-1deg)" }}>
          <span className="absolute top-4 left-4 text-xs tracking-widest" style={{ fontFamily: "var(--font-type)", color: "#C0192C", border: "2px solid #C0192C", padding: "4px 10px" }}>
            VERSO II
          </span>
          <div className="tape tape-yellow" />
          <p className="mt-8 text-2xl md:text-3xl whitespace-pre-line leading-relaxed" style={{ fontFamily: "var(--font-type)" }}>
            {VERSE2}
          </p>
          <p className="mt-4 text-3xl md:text-4xl font-black" style={{ fontFamily: "var(--font-news)" }}>
            Y cuando to' el mundo se viró
          </p>
          <p className="mt-4 text-2xl md:text-3xl whitespace-pre-line leading-relaxed" style={{ fontFamily: "var(--font-hand)" }}>
            {VERSE2_END}
          </p>
        </div>
        <Polaroid src="/assets/couple2.jpg" label="juntos siempre" rot={-3} />
      </section>

      <Torn color="#F2B5C5" />

      {/* ============ BRIDGE ============ */}
      <section className="relative py-24 px-6" style={{ background: "#F2B5C5" }}>
        <StickerField items={[
          { src: "/assets/sticker-monkey2.png", top: "10%", left: "78%", size: 140, rot: 14 },
          { src: "/assets/sticker-heart.png", top: "70%", left: "8%", size: 100, rot: -10 },
        ]} />
        <div className="scrap scrap-pink max-w-2xl mx-auto" style={{ transform: "rotate(2deg)" }}>
          <h2 className="text-5xl font-black mb-6" style={{ fontFamily: "var(--font-news)" }}>PUENTE</h2>
          <p className="text-2xl md:text-3xl leading-relaxed" style={{ fontFamily: "var(--font-hand)" }}>
            Y viendo poco a poco más tu cara<br/>
            Se me olvidó que dolió decir{" "}
            <span className="ink-strike text-5xl italic" style={{ fontFamily: "var(--font-news)" }}>sayonara</span>
            <br/>To' fue de cora, mami, no me debe' nada<br/>
            Mami, no me debe' nada, mami, solo
          </p>
        </div>
        <Polaroid src="/assets/couple3.jpg" label="te amo 🐒" rot={1} />
      </section>

      <Torn color="#C0192C" />

      {/* ============ CHORUS 2 ============ */}
      <section className="relative py-24 px-6" style={{ background: "#C0192C" }}>
        <StickerField items={[
          { src: "/assets/sticker-lips.png", top: "12%", left: "82%", size: 100, rot: 16 },
          { src: "/assets/sticker-monkey4.png", top: "65%", left: "5%", size: 140, rot: -12, delay: 1 },
        ]} />
        <div className="scrap scrap-red max-w-2xl mx-auto" style={{ transform: "rotate(-1.5deg)" }}>
          <h2 className="text-6xl md:text-7xl font-black mb-6" style={{ fontFamily: "var(--font-news)", color: "#1A1A1A" }}>
            CORO ♥
          </h2>
          <div className="text-2xl md:text-3xl leading-relaxed" style={{ fontFamily: "var(--font-hand)" }}>
            <p><span className="ink-underline" style={{ background: "linear-gradient(transparent 70%, #1A1A1A 70%, #1A1A1A 85%, transparent 85%)" }}>Quédate</span> un rato má' <em className="opacity-70">(Un rato má')</em></p>
            <p>Te vo'a cuidar como un <span className="ink-strike">bodyguard</span> <em className="opacity-70">(Un bodyguard)</em></p>
            <p>Un ratito má' <em className="opacity-70">(Un rato má')</em></p>
            <p>Siempre quiero un ratito, un ratito má'</p>
            <p className="mt-3"><span className="ink-underline" style={{ background: "linear-gradient(transparent 70%, #1A1A1A 70%, #1A1A1A 85%, transparent 85%)" }}>Quédate</span> un rato má' <em className="opacity-70">(Un rato má')</em></p>
            <p>Te vo'a cuidar como un <span className="ink-strike">bodyguard</span> <em className="opacity-70">(Un bodyguard)</em></p>
            <p>Un ratito má'</p>
            <p>Siempre quiero un ratito, un ratito má'</p>
          </div>
        </div>
      </section>

      <Torn color="#FFF8F0" />

      {/* ============ OUTRO ECHO ============ */}
      <section className="relative py-32 flex flex-col items-center gap-4">
        {[1, 0.75, 0.55, 0.4, 0.28, 0.18, 0.1].map((op, i) => (
          <p key={i} style={{
            fontFamily: "var(--font-news)",
            fontSize: `${6 - i * 0.7}rem`,
            opacity: op,
            color: "#C0192C",
            transform: `scale(${1 - i * 0.07})`,
            lineHeight: 1,
          }}>
            Uh, uh, uh
          </p>
        ))}
      </section>

      <Torn color="#FAF4EC" />

      {/* ============ GALLERY ============ */}
      <section className="relative py-20 px-6" style={{ background: "#FAF4EC" }}>
        <h2 className="text-center text-[20vw] md:text-[12rem] leading-none" style={{ fontFamily: "var(--font-hand)", color: "#C0192C" }}>
          nosotros
        </h2>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 max-w-7xl mx-auto mt-12 [column-fill:_balance]">
          {Array.from({ length: 15 }).map((_, i) => {
            const rot = ((i * 137) % 11) - 5;
            const annotations = ["este día ♥", "jajaja", "te ves hermosa", "mi favorita", "🐒💘", "siempre tú"];
            const showTape = i % 3 === 0;
            const showSticker = i % 4 === 1;
            const showNote = i % 5 === 2;
            return (
              <div key={i} className="mb-6 break-inside-avoid relative group transition-transform duration-300 hover:scale-105 hover:rotate-0" style={{ transform: `rotate(${rot}deg)` }}>
                <div className="bg-white p-2 shadow-xl">
                  <div style={{ width: "100%", aspectRatio: `${3 + (i % 3)}/${4 + (i % 2)}`, background: "#F2B5C5", overflow: "hidden" }}>
                    <img
                      src={`/assets/gallery${i + 1}.jpg`}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const fallbacks = [
                          "/assets/sticker-monkey1.png",
                          "/assets/sticker-monkey2.png",
                          "/assets/sticker-monkey3.png",
                          "/assets/sticker-monkey4.png",
                          "/assets/news-heart.png",
                        ];
                        (e.currentTarget as HTMLImageElement).src = fallbacks[i % fallbacks.length];
                        (e.currentTarget as HTMLImageElement).style.objectFit = "contain";
                      }}
                    />
                  </div>
                </div>
                {showTape && <div className="tape" />}
                {showSticker && (
                  <img src={STICKERS[i % STICKERS.length]} alt="" className="absolute -bottom-6 -right-4 w-16 floaty pointer-events-none" style={{ "--r": "12deg" } as CSSProperties} />
                )}
                {showNote && (
                  <p className="absolute -bottom-8 left-2 text-2xl rotate-[-6deg]" style={{ fontFamily: "var(--font-scrawl)", color: "#C0192C" }}>
                    {annotations[i % annotations.length]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <Torn color="#C0192C" />

      {/* ============ FINAL ============ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 overflow-hidden" style={{ background: "#C0192C" }}>
        {/* heart rain */}
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="absolute heart-rain"
            style={{
              left: `${(i * 41) % 100}%`,
              fontSize: `${16 + (i % 5) * 10}px`,
              animationDuration: `${6 + (i % 7)}s`,
              animationDelay: `${-(i * 0.6)}s`,
              color: i % 2 ? "#FFF8F0" : "#F2B5C5",
            }}
          >
            ♥
          </span>
        ))}

        <p className="text-center max-w-3xl text-5xl md:text-7xl leading-tight" style={{ fontFamily: "var(--font-hand)", color: "#FFF8F0" }}>
          contigo todo se siente como llegar a casa.<br/>
          gracias por quedarte un rato más conmigo —<br/>
          quédate todos los rato' que quieras, mi monita.<br/>
          te amo, hoy, mañana y siempre. 🤍
        </p>

        <img src="/assets/sticker-monkey1.png" alt="" className="bounce-monkey mt-12 w-56 md:w-72" />

        <button
          onClick={() => window.location.reload()}
          className="mt-12 px-8 py-3 border-2 border-cream text-cream hover:bg-cream hover:text-blood transition-colors"
          style={{ fontFamily: "var(--font-type)", color: "#FFF8F0", borderColor: "#FFF8F0" }}
        >
          volver a empezar ↺
        </button>

        <p className="mt-16 text-sm opacity-70" style={{ fontFamily: "var(--font-type)", color: "#FFF8F0" }}>
          hecho con amor para mi monita 💘
        </p>
      </section>
    </div>
  );
}
