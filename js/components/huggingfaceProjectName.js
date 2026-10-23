function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function huggingfaceProjectName(url) {
  const fallback = 'Hugging Face';
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    const reserved = new Set(['datasets', 'spaces', 'models', 'collections', 'organizations']);
    const name = [...parts].reverse().find((part) => !reserved.has(part.toLowerCase()));
    if (!name) return fallback;
    return escapeHtml(decodeURIComponent(name));
  } catch {
    return fallback;
  }
}

function huggingfaceDownloadStat(pub) {
  const stats = pub && pub.stats && pub.stats.huggingface;
  if (!stats || typeof stats.downloads !== 'number') return '';
  const label = stats.downloads.toLocaleString('en-US');
  const repos = Array.isArray(stats.repos) ? stats.repos : [];
  const title = repos.map((repo) => {
    const kind = repo.type === 'dataset' ? 'dataset' : 'model';
    const downloads = Number(repo.downloads).toLocaleString('en-US');
    return `${repo.id} (${kind}): ${downloads}`;
  }).join('\n');
  const titleAttr = title ? ` title="${escapeHtml(title).replace(/\n/g, '&#10;')}"` : '';
  return `<div class="hf-downloads"${titleAttr}><i class="fa-solid fa-download" aria-hidden="true"></i><span>${label}</span></div>`;
}
