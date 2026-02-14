import crypto from 'crypto';

export function validateApiKey(apiKey: string): boolean {
  if (!apiKey.startsWith('stow-') || apiKey.length !== 41) {
    return false;
  }

  const deviceId = apiKey.slice(5, 37); // 32 chars
  const providedChecksum = apiKey.slice(37, 41); // 4 chars

  // Calculate expected checksum
  const expectedChecksum = crypto.createHash('sha256').update(deviceId).digest('hex').slice(0, 4);

  return providedChecksum === expectedChecksum;
}
