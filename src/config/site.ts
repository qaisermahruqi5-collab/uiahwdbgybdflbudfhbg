// ═══════════════════════════════════════════════════════════════════
// SITE CONFIG — the ONLY file that holds contact details & keys.
// Edit values here; every component reads from this file.
// ═══════════════════════════════════════════════════════════════════

export const SITE = {
  name: 'Genoa Academy Oman',
  whatsappNumber: '96891211599', // country code + number, NO '+' sign
  whatsappDisplay: '+968 9121 1599',
  /** Public contact address — shown in the footer + privacy notice, and used
   *  as the reply-to on application emails. */
  email: 'GAO@genoaacademyom.com',
  instagramUrl: 'https://www.instagram.com/genoaacademyoman/',
  instagramHandle: '@genoaacademyoman',
  /**
   * ⚠️ This key decides WHERE applications are delivered — the inbox is baked
   * into the key by Web3Forms, NOT read from `email` above. This key still
   * delivers to qaisermahruqi10@gmail.com. To move delivery to the address
   * above, generate a new key for it at https://web3forms.com and paste it
   * here, then submit one test application to confirm it arrives.
   */
  web3formsKey: 'aaf1a2bd-47dd-4204-bb74-c133269fe73b',
  web3formsEndpoint: 'https://api.web3forms.com/submit',
  location: 'Muscat, Oman',
  ageMin: 5,
  ageMax: 16,
} as const;

/** Digits only — guards against a stray '+', space or dash in the config. */
const WHATSAPP_DIGITS = SITE.whatsappNumber.replace(/\D/g, '');

/**
 * True for phones/tablets, where the `wa.me` universal link hands off to the
 * installed WhatsApp app. Desktop browsers get web.whatsapp.com instead —
 * `wa.me` on desktop only renders an interstitial that tries a `whatsapp://`
 * protocol handler and dead-ends when the desktop app is not installed.
 */
function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;

  const uaData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData;
  if (typeof uaData?.mobile === 'boolean') return uaData.mobile;

  if (/Android|iPhone|iPod|Opera Mini|IEMobile|BlackBerry|webOS/i.test(navigator.userAgent)) {
    return true;
  }
  /* iPadOS 13+ reports a desktop UA; it is only distinguishable by touch. */
  if (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1) return true;

  return false;
}

/**
 * Build a WhatsApp click-to-chat link, optionally with a prefilled message.
 * Mobile → wa.me (opens the app). Desktop → web.whatsapp.com (opens the chat
 * in WhatsApp Web, or prompts to link a device).
 */
export function whatsappLink(message?: string): string {
  if (isMobileDevice()) {
    const base = `https://wa.me/${WHATSAPP_DIGITS}`;
    return message ? `${base}?text=${encodeURIComponent(message)}` : base;
  }

  const params = new URLSearchParams({ phone: WHATSAPP_DIGITS });
  if (message) params.set('text', message);
  return `https://web.whatsapp.com/send?${params.toString()}`;
}
