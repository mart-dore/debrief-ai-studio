"""Bruitages synthétisés (aucun fichier externe) -> sfx/<nom>.wav (48 kHz mono).
whoosh, swish (court), pop, tick, impact (boum grave), hit (tampon), ding (score), dingdong, riser, glitch, type (clavier), zoom (aspiration)."""
import os, wave, numpy as np
SR = 48000
os.makedirs("sfx", exist_ok=True)
rng = np.random.default_rng(7)

def t_(d): return np.arange(int(SR * d)) / SR
def env(n, a=0.005, r=0.1, curve=4.0):
    x = np.ones(n); na = max(1, int(SR * a)); x[:na] = np.linspace(0, 1, na)
    tail = np.exp(-np.linspace(0, curve, n - na)); x[na:] *= tail; return x
def lp(x, fc):            # passe-bas 1 pôle (fc peut varier)
    fc = np.broadcast_to(fc, x.shape); y = np.zeros_like(x); s = 0.0
    k = 1 - np.exp(-2 * np.pi * fc / SR)
    for i in range(len(x)): s += k[i] * (x[i] - s); y[i] = s
    return y
def bp(x, fc, q=1.0):     # passe-bande simple : passe-bas - passe-bas plus bas
    return lp(x, fc * (1 + 0.5 / q)) - lp(x, fc / (1 + 0.5 / q))
def save(name, x, gain=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * gain
    with wave.open(f"sfx/{name}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())

# whoosh : bruit filtré dont la fréquence monte puis redescend
d = 0.55; t = t_(d); n = len(t); u = t / d
fc = 300 + 3200 * np.sin(np.pi * u) ** 2
x = bp(rng.standard_normal(n), fc, 0.8) * np.sin(np.pi * u) ** 1.5
save("whoosh", x, 0.85)
# swish : whoosh court et aigu
d = 0.28; t = t_(d); n = len(t); u = t / d
x = bp(rng.standard_normal(n), 1200 + 5000 * u, 0.9) * np.sin(np.pi * u) ** 2
save("swish", x, 0.8)
# pop : bulle (sinus qui descend vite)
d = 0.12; t = t_(d); f = 900 * np.exp(-t * 28) + 380
x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, d, 7)
save("pop", x, 0.8)
# tick : petit clic
d = 0.035; t = t_(d); x = (np.sin(2 * np.pi * 2400 * t) + 0.5 * rng.standard_normal(len(t))) * env(len(t), 0.0005, d, 9)
save("tick", x, 0.6)
# impact : boum grave + attaque bruitée
d = 0.9; t = t_(d); f = 120 * np.exp(-t * 6) + 42
x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, d, 5)
x += 0.6 * lp(rng.standard_normal(len(t)), 2500) * env(len(t), 0.001, 0.1, 30)
save("impact", x, 0.95)
# hit : tampon (claque médium)
d = 0.35; t = t_(d); f = 220 * np.exp(-t * 18) + 90
x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, d, 9) + 0.8 * bp(rng.standard_normal(len(t)), 1800, 1) * env(len(t), 0.001, d, 22)
save("hit", x, 0.9)
# ding : cloche claire (score)
d = 0.9; t = t_(d)
x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, a, k in [(1318.5, 1, 5), (2637, 0.35, 8), (3955, 0.15, 12), (1975.5, 0.2, 6)])
x *= env(len(t), 0.002, d, 0.1)
save("ding", x, 0.7)
# dingdong : deux notes montantes (révélation / note)
d = 0.75; t = t_(d); x = np.zeros(len(t))
for st, f in [(0.0, 987.8), (0.12, 1318.5)]:
    m = t >= st; tt = t[m] - st
    x[m] += sum(a * np.sin(2 * np.pi * f * h * tt) * np.exp(-tt * k) for h, a, k in [(1, 1, 6), (2, 0.3, 9), (3, 0.12, 13)])
save("dingdong", x, 0.7)
# riser : montée (avant une révélation)
d = 1.1; t = t_(d); u = t / d
x = bp(rng.standard_normal(len(t)), 400 + 6000 * u ** 2, 1.2) * u ** 2 + 0.25 * np.sin(2 * np.pi * np.cumsum(200 + 900 * u ** 2) / SR) * u ** 2
x *= np.minimum(1, (d - t) / 0.03)
save("riser", x, 0.75)
# glitch : salves de bruit hachées
d = 0.32; t = t_(d); n = len(t); x = np.zeros(n)
for k in range(9):
    a = int(rng.uniform(0, n - 1200)); L = int(rng.uniform(300, 1600))
    seg = np.sign(np.sin(2 * np.pi * rng.uniform(150, 1500) * np.arange(L) / SR)) * rng.uniform(0.4, 1)
    m = min(L, n - a); x[a:a + m] += seg[:m]
x = x * env(n, 0.001, d, 2) + 0.3 * rng.standard_normal(n) * (x != 0)
save("glitch", x, 0.55)
# type : 5 frappes de clavier
d = 0.6; n = int(SR * d); x = np.zeros(n)
for k in range(6):
    a = int((0.02 + k * 0.095 + rng.uniform(-0.015, 0.015)) * SR); L = int(0.03 * SR)
    c = bp(rng.standard_normal(L), rng.uniform(2500, 4200), 1.5) * env(L, 0.0005, 0.03, 10)
    x[a:a + L] += c[: n - a]
save("type", x, 0.5)
# zoom : aspiration rapide (bruit qui monte + sub)
d = 0.42; t = t_(d); u = t / d
x = bp(rng.standard_normal(len(t)), 500 + 7000 * u ** 3, 1.0) * u ** 1.5 + 0.5 * np.sin(2 * np.pi * np.cumsum(60 + 200 * u) / SR) * u
x *= np.minimum(1, (d - t) / 0.01)
save("zoom", x, 0.8)
print("ok", sorted(os.listdir("sfx")))
