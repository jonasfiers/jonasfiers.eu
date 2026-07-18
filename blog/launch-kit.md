# PICASSO blog series — launch kit

Promo copy for the 6-part PICASSO series. All copy is written on the **honest premise**:
copybook parsing is a solved problem *everywhere except inside OutSystems* — concede the
prior art (JRecord/cb2xml/Cobrix/compilers, and the immature .NET NuGet parsers) up front,
then pin the narrow gap (no Forge connector; no mature/validated/native .NET decoder) and
foreground the differentiator (validated against a real COBOL compiler).

## Pre-launch checklist
- [ ] **Make the PICASSO repo public** — every link below and the "Show HN" assume it; otherwise they 404.
- [ ] Set the post dates to a consistent **Tuesday** cadence (mid-week mornings are the B2B/technical sweet spot; weekends are the worst slot). Suggested: Part 1 Tue 21 Jul → weekly through Part 6 Tue 25 Aug.
- [ ] Fill in the `[URL]` placeholders once the posts are live.

## Strategy in one line
Two audiences: **OutSystems/enterprise** (the adopters — LinkedIn + OutSystems community + mainframe circles) and the **broad dev world** (the reach — HN/Reddit/dev.to, pulled in by the *validation*, *real-file-finds-bugs*, and *AI-authorship* hooks rather than the COBOL niche itself). Ship on LinkedIn + community every Tuesday; save the one big HN/Reddit push for the strongest single post (Part 1 or Part 5).

---

## LinkedIn — Part 1
*Native post; put the link in the **first comment** (LinkedIn throttles posts with external links in the body).*

> Copybook parsing is a solved problem. JRecord and cb2xml have done it in Java for 20 years; every COBOL compiler does it.
>
> Just — not inside OutSystems.
>
> Search the Forge for "cobol" or "mainframe" and you get nothing. So when an OutSystems team needs to read a mainframe extract, they do the only thing left: open the copybook and count byte offsets by hand into a config — the same fragile transcription the rest of the world automated decades ago. (The .NET copybook parsers that do exist? Unmaintained, undocumented, and not something you'd stake a financial record on.)
>
> So I built the piece that was missing: a native .NET copybook parser, packaged for OutSystems, that reads the `.cpy` and derives the whole byte layout itself — COMP-3, EBCDIC, signs, OCCURS, REDEFINES — and I validated every layout against a real COBOL compiler (GnuCOBOL) and a genuine 1990s mainframe file.
>
> Writing the whole build up as a series, starting with why this specific gap was worth closing. (There's also an honest twist about who wrote the code — Part 5.)
>
> Part 1 👇
>
> #OutSystems #COBOL #LowCode #dotnet #MainframeModernization

*First comment:* `The thing that should already exist → [Part 1 URL]. New part every Tuesday.`

---

## Hacker News — "Show HN"
*Title:*

> Show HN: PICASSO – a COBOL copybook parser for OutSystems, validated against GnuCOBOL

*First comment (post immediately after submitting — the concession leads, because HN will raise it otherwise):*

> Author here. PICASSO reads a COBOL copybook (.cpy) and derives the exact byte layout — offsets, COMP-3, binary COMP, EBCDIC cp037, signs, OCCURS/REDEFINES — then decodes/encodes fixed-width mainframe records against it.
>
> Let me get the obvious objection out of the way first, because you'd be right to raise it: **copybook parsing is not a new problem.** JRecord and cb2xml have done it in Java for 20 years, Cobrix does it on Spark, every COBOL compiler does it. I didn't invent anything.
>
> The gap I hit is narrow and platform-specific: I work in OutSystems (a .NET-based low-code platform), and there's no COBOL connector in its marketplace — reaching JRecord et al. from there means standing up a separate Java service beside your app. The .NET copybook parsers on NuGet are unmaintained, undocumented, mostly structure-only (not validated decoders), and none is packaged for the platform. So OutSystems teams hand-roll it. PICASSO is a native .NET, MIT-licensed, zero-dependency parser built to be that missing extension.
>
> Two honest caveats: (1) it's the engine + Integration Studio action classes, **not yet a packaged Forge extension** — today it's a library; (2) **I didn't write the C#** — I picked the problem, set scope, and validated every layout, but the implementation was AI-written under my direction, and the write-up is candid about that.
>
> The part I'd point at: validation. Layouts are diffed against what GnuCOBOL computes, and a real DTAR020 extract round-trips byte-for-byte against values a third-party tool published. Happy to answer anything.

*(Parts 4 and 5 may out-perform Part 1 on HN — the "validate against a real compiler" and "directed an AI" angles are very HN. Consider leading HN with the repo now, and a strong essay later.)*

---

## X / Twitter — Part 1 thread

> 1/ Copybook parsing is a solved problem — JRecord & cb2xml have done it in Java for 20 years, every COBOL compiler does it. So why build another? Because none of it works *inside OutSystems*, the platform I ship in. 🧵
>
> 2/ Search the OutSystems Forge for "cobol" or "mainframe" → nothing. So teams read the copybook and count byte offsets by hand. Here's the actual hand-transcription, from one of my projects: `{ name:'totalPaid', start:12, len:9 }`. `PIC 9(7)V99` → 9 bytes at offset 12.
>
> 3/ The .NET copybook parsers that *do* exist? Unmaintained, undocumented, mostly structure-only. Nothing you'd stake a financial record on — and none packaged for OutSystems.
>
> 4/ So I built the missing piece: a native .NET parser that reads the .cpy and derives the whole layout — COMP-3, EBCDIC, signs, OCCURS, REDEFINES — and decodes the real records.
>
> 5/ The part I care about most: I validated every layout against a real COBOL compiler (GnuCOBOL) and a genuine 1990s mainframe file. Most parsers hand you a layout; almost none prove it's right.
>
> 6/ Twist: I didn't write the C#. I found the problem, set scope, validated it — an AI wrote it under my direction. Part 1: [URL] · new part every Tuesday. #COBOL #dotnet #OutSystems

---

## Reddit — one genuine post (r/cobol, or r/programming for reach)
*Title:*

> I built a native .NET COBOL copybook parser for OutSystems — and validated it against a real compiler

*Body:*

> Copybook parsing is well-solved in Java (JRecord, cb2xml), Spark (Cobrix), and the compilers themselves — but not inside OutSystems, the low-code platform I work in. Its marketplace has no COBOL connector, and the .NET copybook parsers on NuGet are unmaintained/undocumented/structure-only. So OutSystems teams hand-roll offset parsing (COMP-3 widths, EBCDIC, sign nibbles) into a config, by hand.
>
> I built the missing piece: a native .NET, MIT-licensed parser that reads the .cpy and derives the layout itself, validated against GnuCOBOL and a real 1990s extract. Honest disclosure in the write-up: I directed the build and did the validation, but the C# was AI-written — and it's the engine, not yet a packaged Forge extension.
>
> Post (part 1): [URL] · Repo: [URL]

*Reddit etiquette: each sub has self-promo rules — reply in comments, don't drop-and-leave, and skip subs where you haven't participated.*

---

## TODO
- [ ] Shorter per-part LinkedIn posts for Parts 2–6 (weekly cadence).
- [ ] Fill `[URL]` placeholders after publish.
