"use server";
import crypto from "crypto";
import fs from "fs";

const FILE_UPLOADED_SUCCESSFULLY = "File uploaded successfully";
const NO_FILE_PROVIDED = "No file provided or file is empty";

export async function handleSubmit(formData) {
  // console.log("FileHandle:", formData);
  // handle form submission on the server

  return { success: true, message: FILE_UPLOADED_SUCCESSFULLY };
}
