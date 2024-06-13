"use client";

import { useEffect } from "react";

export default function FileError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </>
  );
}
