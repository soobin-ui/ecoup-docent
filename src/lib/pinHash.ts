/*
  스태프 번호를 휴대폰 안에서 바로 확인하기 위한 '암호처럼 바꾼 값'.
  실제 번호는 앱에 넣지 않고 PBKDF2(SHA-256) 로 바꾼 값만 넣는다.
  값 만들기: node tools/make_pin_hash.mjs  →  .env.production.local 의 VITE_STAFF_PIN_HASH="반복:소금:해시"
  (tools/make_pin_hash.mjs 와 같은 방식이어야 함)
*/
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('')
const unhex = (h: string) => new Uint8Array(h.match(/../g)!.map((x) => parseInt(x, 16)))

export async function pinHash(pin: string, saltHex: string, iter: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unhex(saltHex), iterations: iter }, key, 256)
  return hex(bits)
}

/** "반복:소금:해시" 와 입력한 번호가 맞는지 */
export async function pinMatches(pin: string, stored: string): Promise<boolean> {
  const [it, salt, h] = stored.split(':')
  if (!it || !salt || !h) return false
  return (await pinHash(pin, salt, Number(it))) === h
}
