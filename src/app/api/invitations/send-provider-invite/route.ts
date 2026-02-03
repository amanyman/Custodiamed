import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      token,
      providerEmail,
      providerName,
      patientName,
      studyType,
      studyDate,
      message,
    } = body;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://custodiamed.com";
    const inviteLink = `${siteUrl}/provider-invite/${token}`;

    const formattedDate = studyDate
      ? new Date(studyDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'Not specified';

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "CustodiaMed <onboarding@resend.dev>",
      to: [providerEmail],
      subject: `${patientName} shared medical imaging with you`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Medical Records Shared With You</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Custodia<span style="opacity: 0.9;">Med.</span>
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Secure Medical Imaging Platform
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Badge -->
              <div style="text-align: center; margin-bottom: 30px;">
                <span style="display: inline-block; background-color: #f0f9ff; color: #4f46e5; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                  📋 Medical Records Shared
                </span>
              </div>

              <h2 style="margin: 0 0 10px; color: #1a1a1a; font-size: 24px; font-weight: 700; text-align: center;">
                ${providerName ? `Hello Dr. ${providerName.replace('Dr. ', '')}` : 'Hello'}
              </h2>

              <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6; text-align: center;">
                <strong>${patientName}</strong> has shared their medical imaging with you through CustodiaMed.
              </p>

              <!-- Study Info Box -->
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <span style="color: #64748b; font-size: 13px;">Study Type</span><br>
                      <span style="color: #1a1a1a; font-size: 16px; font-weight: 600;">${studyType || 'Medical Imaging'}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: ${message ? '12px' : '0'};">
                      <span style="color: #64748b; font-size: 13px;">Study Date</span><br>
                      <span style="color: #1a1a1a; font-size: 16px; font-weight: 600;">${formattedDate}</span>
                    </td>
                  </tr>
                  ${message ? `
                  <tr>
                    <td style="border-top: 1px solid #e2e8f0; padding-top: 16px;">
                      <span style="color: #64748b; font-size: 13px;">Personal Message</span><br>
                      <p style="margin: 8px 0 0; color: #475569; font-size: 14px; font-style: italic; line-height: 1.5;">"${message}"</p>
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
                  View Medical Records
                </a>
              </div>

              <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center; line-height: 1.5;">
                You'll need to create a free CustodiaMed provider account to securely access these records.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">
                This invitation expires in 7 days.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                If you didn't expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>

        <!-- Sub-footer -->
        <p style="margin: 24px 0 0; color: #94a3b8; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} CustodiaMed. Secure medical imaging sharing.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      inviteLink,
    });
  } catch (error) {
    console.error("Error sending invitation:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
