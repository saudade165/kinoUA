#!/usr/bin/env python3
"""Приблизна оцінка рівня CEFR англійського транскрипту (WebVTT або SRT).

Це НЕ сертифікат CEFR, а евристика для фільтра каталогу. Результат завжди позначається як приблизний.

Використання:
  python3 tools/cefr.py субтитри.en.vtt [ще.srt ...]        → звіт і JSON із рівнем
  python3 tools/cefr.py --json субтитри.en.vtt              → лише JSON (поле content.lvl у Supabase)

Частотний список англійських слів (20 000 найуживаніших) завантажується один раз у tools/.cache/:
first20hours/google-10000-english (Google Web Trillion Word Corpus; освітнє й дослідницьке використання).
Для комерційного запуску замініть його ліцензованим частотним словником — формат: одне слово на рядок, від найчастішого.

Що враховується (кожна метрика дає бал 0…5, підсумок — зважене середнє):
  • лексика: частка слів поза 3000 і 8000 найуживаніших (без власних імен; частка поза 1000 — довідково);
  • середня довжина речення у словах;
  • темп мовлення: слів за хвилину (з таймкодів);
  • ідіоми, фразові дієслова й сленг (невеликий список-маркер);
  • граматика: умовні, пасив, перфектні й модальні конструкції;
Чіткість вимови з тексту оцінити неможливо — вона не враховується, і це сказано в результаті.
"""
import json, os, re, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, ".cache", "en-20k.txt")
FREQ_URL = "https://raw.githubusercontent.com/first20hours/google-10000-english/master/20k.txt"
LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]

IDIOMS = ["give up", "hold on", "come on", "figure out", "get over", "look after", "run out", "turn out", "make up", "put up with",
          "piece of cake", "break a leg", "hang in there", "no way", "gonna", "wanna", "gotta", "ain't", "y'all", "kinda", "sorta",
          "screw", "dude", "bro", "freaking", "pissed", "nailed it", "on the fence", "call it a day", "under the weather", "get it together",
          "back off", "keep up", "set off", "pull off", "bring up", "go through", "work out", "cut it out", "what's up"]
GRAMMAR = [r"\bif\b.*\bwould\b", r"\bwould have\b", r"\b(had|has|have) been\b", r"\b(was|were|been|being) \w+ed\b", r"\b(might|could|should|must) have\b",
           r"\bwish\b.*\b(had|were)\b", r"\bnot only\b", r"\bwhom\b", r"\bwhereas\b", r"\bhad (?!to\b)\w+ed\b"]

def freq():
    if not os.path.exists(CACHE):
        os.makedirs(os.path.dirname(CACHE), exist_ok=True)
        urllib.request.urlretrieve(FREQ_URL, CACHE)
    words = [w.strip().lower() for w in open(CACHE, encoding="utf-8") if w.strip()]
    return {w: i + 1 for i, w in enumerate(words)}

def ts(s):
    p = s.replace(",", ".").split(":")
    return float(p[-1]) + 60 * int(p[-2]) + (3600 * int(p[-3]) if len(p) > 2 else 0)

def cues(path):
    """[(start, end, text)] з VTT або SRT."""
    out, cur = [], None
    for line in open(path, encoding="utf-8-sig"):
        line = line.strip()
        m = re.match(r"([\d:.,]+)\s*-->\s*([\d:.,]+)", line)
        if m:
            cur = [ts(m.group(1)), ts(m.group(2)), []]; out.append(cur); continue
        if not line:
            cur = None; continue
        if cur is not None and not line.isdigit():
            cur[2].append(re.sub(r"<[^>]+>|\{[^}]+\}", "", line))
    return [(a, b, " ".join(t)) for a, b, t in out if t]

def band(x, cuts):
    """Значення → бал 0..5 за порогами cuts (5 порогів, за зростанням)."""
    return sum(1 for c in cuts if x > c)

def estimate(paths, rank):
    cs = [c for p in paths for c in cues(p)]
    if not cs:
        return None
    text = " ".join(c[2] for c in cs)
    speech = sum(max(0.0, b - a) for a, b, _ in cs)
    sents = [s for s in re.split(r"[.!?…]+", text) if re.search(r"[A-Za-z]", s)]
    toks = re.findall(r"[A-Za-z]+(?:'[a-z]+)?", text)
    # власні імена: слова з великої літери не на початку речення, яких немає в частотному списку
    lex = [w.lower() for w in toks if not (w[0].isupper() and w.lower() not in rank)]
    base = [re.sub(r"'(s|re|ve|ll|d|t|m)$", "", w) for w in lex]
    def share(n): return sum(1 for w in base if rank.get(w, 10 ** 6) > n) / max(1, len(base))
    off1k, off3k, off8k = share(1000), share(3000), share(8000)
    sl = len(toks) / max(1, len(sents))
    wpm = len(toks) / (speech / 60) if speech > 0 else None
    low = text.lower()
    idi = sum(low.count(i) for i in IDIOMS) / max(1, len(sents))
    gr = sum(len(re.findall(g, low)) for g in GRAMMAR) / max(1, len(sents))
    m = {
        "vocab": band(off3k + off8k * 2, [0.06, 0.12, 0.18, 0.25, 0.33]),
        "sentence": band(sl, [5, 7.5, 10, 13, 17]),
        "rate": band(wpm, [110, 135, 155, 175, 195]) if wpm else None,
        "idioms": band(idi, [0.05, 0.12, 0.22, 0.35, 0.5]),
        "grammar": band(gr, [0.03, 0.08, 0.15, 0.25, 0.4]),
    }
    w = {"vocab": 0.35, "sentence": 0.2, "rate": 0.2, "idioms": 0.15, "grammar": 0.1}
    used = {k: v for k, v in m.items() if v is not None}
    score = sum(used[k] * w[k] for k in used) / sum(w[k] for k in used)
    lvl = LEVELS[min(5, int(round(score)))]
    return {
        "v": lvl, "approx": True, "lang": "en", "method": "kinoua-cefr-1",
        "basis": {"words": len(toks), "sentences": len(sents), "minutes": round(speech / 60, 2),
                  "wpm": round(wpm) if wpm else None, "avgSentence": round(sl, 1),
                  "beyond1k": round(off1k, 3), "beyond3k": round(off3k, 3), "beyond8k": round(off8k, 3),
                  "idiomsPerSentence": round(idi, 2), "complexGrammarPerSentence": round(gr, 2)},
        "scores": m, "score": round(score, 2),
        "notes": "Pronunciation clarity is not measurable from text and is not included.",
        "warning": "small sample" if len(toks) < 400 else None,
    }

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        print(__doc__); sys.exit(1)
    r = estimate(args, freq())
    if r is None:
        print("no cues found", file=sys.stderr); sys.exit(2)
    if "--json" in sys.argv:
        print(json.dumps(r, ensure_ascii=False)); sys.exit(0)
    print(f"≈ {r['v']} (approximate, not a CEFR certificate) · score {r['score']}")
    for k, v in r["basis"].items(): print(f"  {k}: {v}")
    print("  sub-scores 0..5:", r["scores"])
    if r["warning"]: print("  warning:", r["warning"])
