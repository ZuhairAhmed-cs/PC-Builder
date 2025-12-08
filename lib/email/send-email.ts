export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const response = await fetch(
      "https://eu-app.contentstack.com/automations-api/run/a567d517f48543abbbe9bb2255d1e918",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          email: to,
          body: html,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Email API returned ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

