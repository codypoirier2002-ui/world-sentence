// The "building your world" sequence. Plays staged lines while the recipe is
// being made, never finishes faster than a beat, and stalls gracefully if the
// AI is slow.
const STAGES = [
  'Reading your sentence…',
  'Raising the terrain…',
  'Mixing the sky…',
  'Unpacking the props…',
  'Waking the locals…',
  'Painting the signs…',
];
const STALLS = [
  'Consulting the local authorities…',
  'The locals are rehearsing their lines…',
  'Arguing about where the landmarks go…',
  'Re-painting a sign that was too honest…',
  'Asking the weather what it wants…',
];

export async function playBuildSequence(els, sentence, work, { minMs = 2600 } = {}) {
  const { screen, sentenceEl, stageEl, barEl } = els;
  sentenceEl.textContent = sentence;
  stageEl.textContent = STAGES[0];
  barEl.style.width = '4%';
  screen.classList.add('show');
  const start = performance.now();
  let done = false, i = 0;
  const per = minMs / STAGES.length;
  const timer = setInterval(() => {
    const t = performance.now() - start;
    if (!done && t > minMs) {
      // still waiting on the recipe: cycle stall lines, creep the bar
      const k = Math.floor((t - minMs) / 1800) % STALLS.length;
      stageEl.textContent = STALLS[k];
      barEl.style.width = `${Math.min(92, 80 + (t - minMs) / 400)}%`;
      return;
    }
    i = Math.min(STAGES.length - 1, Math.floor(t / per));
    stageEl.textContent = STAGES[i];
    barEl.style.width = `${Math.min(80, 6 + (t / minMs) * 74)}%`;
  }, 120);
  try {
    const [result] = await Promise.all([work, new Promise((r) => setTimeout(r, minMs))]);
    done = true;
    return result;
  } finally {
    done = true;
    clearInterval(timer);
    barEl.style.width = '100%';
    stageEl.textContent = 'Done.';
    await new Promise((r) => setTimeout(r, 260));
  }
}

export function hideBuild(els) { els.screen.classList.remove('show'); }
