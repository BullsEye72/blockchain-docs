"use server";

import crypto from "crypto";
import fs from "fs";
import { Readable } from "stream";

export async function hashFile(fileByteArray, fileName) {
  try {
    const startTime = Date.now();
    console.log("📁 A file is being processed ! Name : ", fileName);

    const fileBuffer = Buffer.from(fileByteArray);
    const fileSizeInBytes = fileBuffer.length;
    const fileSizeInMegabytes = (fileSizeInBytes / (1024 * 1024)).toFixed(3);
    // console.log("📁", fileName, " - Size:", fileSizeInMegabytes, "MB");

    const fileHash = crypto.createHash("sha256");
    const fileStream = Readable.from(fileBuffer);

    for await (const chunk of fileStream) {
      fileHash.update(chunk);
    }

    const hash = fileHash.digest("hex");

    const endTime = Date.now();
    const processingTime = endTime - startTime;
    // console.log("Hashing time: ", processingTime, "ms");
    // console.log("hash: ", hash);

    return { hash, processingTime };
  } catch (error) {
    console.error("Error while hashing the file: ", error);
    return { hash: "", processingTime: 0 };
  }
}
