"use server";

export async function sendToEthereum() {
  // handle form submission on the server
  console.log("I SHOULD BE ON THE SERVER SIDE!");
  return { success: true, message: "File uploaded successfully" };
}
