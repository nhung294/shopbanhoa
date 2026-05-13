const { PayOS } = require('@payos/node');

if (!process.env.PAYOS_CLIENT_ID || !process.env.PAYOS_API_KEY || !process.env.PAYOS_CHECKSUM_KEY) {
  console.error('ERROR: Missing PayOS configuration');
  console.error('Required env vars: PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY');
  process.exit(1);
}

const payos = new PayOS({
  PAYOS_CLIENT_ID: process.env.PAYOS_CLIENT_ID,
  PAYOS_API_KEY: process.env.PAYOS_API_KEY,
  PAYOS_CHECKSUM_KEY: process.env.PAYOS_CHECKSUM_KEY,
});

module.exports = payos;
