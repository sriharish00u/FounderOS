import crypto from 'crypto';

const ALGO = 'aes-256-gcm';

let KEY: Buffer | null = null;

const getKey = (): Buffer => {
  if (KEY) return KEY;
  const raw = process.env.ENCRYPTION_KEY || 'founderos-dev-fallback-key-not-for-prod';
  KEY = crypto.createHash('sha256').update(raw).digest();
  return KEY;
};

export interface CipherPayload {
  iv: string;
  tag: string;
  data: string;
}

export const encryptSecret = (plain: string): CipherPayload => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const data = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  return {
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    data: data.toString('base64')
  };
};

export const decryptSecret = (payload: CipherPayload): string => {
  const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(payload.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(payload.data, 'base64')),
    decipher.final()
  ]);
  return dec.toString('utf8');
};