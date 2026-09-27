/**
 * Returns the reliable public production / share URL for Internet Mission.
 * Never exposes private AI Studio editor or dev container URLs.
 */
export function getPublicAppUrl(): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (
      origin &&
      !origin.includes('aistudio.google.com') &&
      !origin.includes('localhost') &&
      !origin.includes('ais-dev-')
    ) {
      return origin;
    }
  }
  return 'https://ais-pre-fnx6y3rvzzb2u5c3rfvvwe-127517528929.europe-west3.run.app';
}
