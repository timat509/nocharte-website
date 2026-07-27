exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  }

  try {
    const { slug, pin, email } = JSON.parse(event.body || "{}");

    if (!slug || !pin || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing email, PIN, or album." }),
      };
    }

    const albums = {
      "the_trip-30-05-26": {
        title: "The Trip X Santi — 30-05-26",
        pin: process.env.ALBUM_THE_TRIP_PIN,
        zipUrl: process.env.ALBUM_THE_TRIP_ZIP_URL,
      },

      "light_out-20-06-26": {
        title: "Light Out — 20-06-26",
        pin: process.env.ALBUM_LIGHT_OUT_PIN,
        zipUrl: process.env.ALBUM_LIGHT_OUT_ZIP_URL,
      },

      "cielo-24-07-26": {
        title: "Cielo — 24-07-26",
        pin: process.env.ALBUM_CIELO_JUL_PIN,
        zipUrl: process.env.ALBUM_CIELO_JUL_ZIP_URL,
      },

      "gigolo_by_fondoblanco-25-07-26": {
        title: "Gigolo by Fondo Blanco — 25-07-26",
        pin: process.env.ALBUM_GIGOLO_PIN,
        zipUrl: process.env.ALBUM_GIGOLO_ZIP_URL,
      },

    };

    

    const album = albums[slug];

    if (!album) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Album not found." }),
      };
    }

    if (String(pin).trim() !== String(album.pin || '').trim()) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Incorrect PIN." }),
      };
    }

    if (!album.zipUrl) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Download link is not configured." }),
      };
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.NOCHARTE_FROM_EMAIL || "NOCHARTE <onboarding@resend.dev>";

    if (!resendApiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Email service is not configured." }),
      };
    }

    const emailHtml = `
      <div style="background:#050505;padding:40px 20px;font-family:Arial,sans-serif;color:#ffffff;">
        <div style="max-width:560px;margin:0 auto;background:#111111;border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:34px;">
          <p style="letter-spacing:3px;text-transform:uppercase;color:#aaa;font-size:12px;margin:0 0 18px;">
            NOCHARTE
          </p>

          <h1 style="font-size:30px;line-height:1.1;margin:0 0 18px;color:#fff;">
            Your album is ready
          </h1>

          <p style="font-size:16px;line-height:1.6;color:#ddd;margin:0 0 24px;">
            Your ZIP for <strong>${album.title}</strong> is ready to download.
          </p>

          <a href="${album.zipUrl}" target="_blank" style="display:inline-block;background:#ffffff;color:#000000;text-decoration:none;padding:15px 24px;border-radius:999px;font-weight:bold;letter-spacing:.5px;">
            Download ZIP
          </a>

          <p style="font-size:13px;line-height:1.6;color:#888;margin:28px 0 0;">
            If the button does not work, copy and paste this link into your browser:<br>
            <span style="color:#bbb;">${album.zipUrl}</span>
          </p>

          <p style="font-size:12px;color:#666;margin:32px 0 0;">
            WE FRAME THE FEELING
          </p>
        </div>
      </div>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: `Your NOCHARTE album is ready — ${album.title}`,
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Email could not be sent.",
          details: resendData,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Download link sent successfully.",
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Server error.",
        error: error.message,
      }),
    };
  }
};