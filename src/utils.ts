export function randomString () {
  let result = '', i, random, buf = new Uint8Array(16)
  window.crypto.getRandomValues(buf)
  for (i = 0; i < 16; i++) {
    random = buf[i] % 16
    result += random.toString(16)
  }
  return result
}