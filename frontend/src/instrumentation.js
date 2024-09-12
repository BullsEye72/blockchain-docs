export async function register() {
  // Do things at start of the server here

  try {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stripeevents/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Stripe Listener started!");
      });
  } catch (error) {
    console.error("Error:", error);
  }
}
