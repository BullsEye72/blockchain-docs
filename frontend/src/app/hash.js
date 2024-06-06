"use server";

import crypto from "crypto";
import fs from "fs";
import { Readable } from "stream";

export async function hashFile(fileByteArray, fileName) {
  const startTime = Date.now();

  const fileBuffer = Buffer.from(fileByteArray);
  const fileSizeInBytes = fileBuffer.length;
  const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
  console.log("A file is being processed !", fileName, "Size: ", fileSizeInBytes, "bytes");

  const fileHash = crypto.createHash("sha256");
  const fileStream = Readable.from(fileBuffer);

  for await (const chunk of fileStream) {
    fileHash.update(chunk);
  }

  const hash = fileHash.digest("hex");

  const endTime = Date.now();
  const processingTime = endTime - startTime;
  console.log("Hashing time: ", processingTime, "ms");
  console.log("hash: ", hash);

  return { hash, processingTime };
}
