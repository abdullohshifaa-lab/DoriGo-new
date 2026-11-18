import uz from './uz.js'
import ru from './ru.js'
import en from './en.js'

export const LANGS = { uz, ru, en }
export const LANG_LABELS = { uz: 'O‘zbekcha', ru: 'Русский', en: 'English' }

// Deep-merge a translation over the Uzbek base so untranslated keys fall back to Uzbek.
function merge(base, over) {
  if (!over) return base
  const out = Array.isArray(base) ? [...base] : { ...base }
  for (const k of Object.keys(over)) {
    const b = base?.[k]
    const o = over[k]
    out[k] = b && typeof b === 'object' && !Array.isArray(b) && typeof o === 'object' ? merge(b, o) : o
  }
  return out
}

export function getDict(lang) {
  return lang === 'uz' ? uz : merge(uz, LANGS[lang])
}
