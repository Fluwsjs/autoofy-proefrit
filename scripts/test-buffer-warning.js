const { authenticator } = require("otplib");
const QRCode = require("qrcode");

async function test() {
  console.log("Testing otplib...");
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri("test@example.com", "Test", secret);
  console.log("otplib done.");

  console.log("Testing qrcode...");
  await QRCode.toDataURL(otpauth);
  console.log("qrcode done.");
}

test().catch(console.error);

