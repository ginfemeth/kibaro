import crypto from 'crypto';

export class Encrypter {
  static algorithm = "aes256";
  static key = crypto.scryptSync("^&%#@%&%ggduasg!@!wydsadas", "salt", 32);

  static encrypt(clearText: any) {
    const iv = crypto.randomBytes(16);
    try {
      const cipher = crypto.createCipheriv(
        Encrypter.algorithm,
        Encrypter.key,
        iv
      );
      const encrypted = cipher.update(clearText, "utf8", "hex");
      return [
        encrypted + cipher.final("hex"),
        Buffer.from(iv).toString("hex"),
      ].join("|");
    } catch (error) {
      return error;
    }
  }

  static decrypt(encryptedText: any): Buffer {
    try {
      const [encrypted, iv] = encryptedText.split("|");
      if (!iv) throw new Error("IV not found");

      const decipher = crypto.createDecipheriv(
        Encrypter.algorithm,
        Encrypter.key,
        Buffer.from(iv, "hex")
      );

      // Convert hex string to Buffer
      const encryptedBuffer = Buffer.from(encrypted, 'hex');

      return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    } catch (error: any) {
      return Buffer.from(error.message);
    }
  }
}