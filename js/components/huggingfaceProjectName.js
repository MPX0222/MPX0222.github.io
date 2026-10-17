function huggingfaceProjectName(url) {
  const fallback = 'Hugging Face';
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    const reserved = new Set(['datasets', 'spaces', 'models', 'collections', 'organizations']);
    const name = [...parts].reverse().find((part) => !reserved.has(part.toLowerCase()));
    if (!name) return fallback;
    return decodeURIComponent(name).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  } catch {
    return fallback;
  }
}
