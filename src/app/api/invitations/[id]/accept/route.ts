import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Get patient record
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!patient) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Get invitation
  const { data: invitation } = await supabase
    .from("invitations")
    .select("*")
    .eq("id", id)
    .eq("email", user.email)
    .eq("status", "pending")
    .single();

  if (!invitation) {
    return NextResponse.redirect(
      new URL("/patient/providers?error=invalid_invitation", request.url)
    );
  }

  // Check if expired
  if (new Date(invitation.expires_at) < new Date()) {
    await supabase
      .from("invitations")
      .update({ status: "expired" })
      .eq("id", id);

    return NextResponse.redirect(
      new URL("/patient/providers?error=expired_invitation", request.url)
    );
  }

  // Create relationship
  const { error: relationshipError } = await supabase
    .from("patient_provider_relationships")
    .insert({
      patient_id: patient.id,
      provider_id: invitation.provider_id,
      status: "active",
    });

  if (relationshipError) {
    // Check if relationship already exists
    if (relationshipError.code === "23505") {
      // Update existing relationship to active
      await supabase
        .from("patient_provider_relationships")
        .update({ status: "active" })
        .eq("patient_id", patient.id)
        .eq("provider_id", invitation.provider_id);
    } else {
      return NextResponse.redirect(
        new URL("/patient/providers?error=failed", request.url)
      );
    }
  }

  // Update invitation status
  await supabase
    .from("invitations")
    .update({ status: "accepted" })
    .eq("id", id);

  // Create audit log
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "invitation.accept",
    resource_type: "invitation",
    resource_id: id,
    details: { provider_id: invitation.provider_id },
  });

  return NextResponse.redirect(
    new URL("/patient/providers?success=connected", request.url)
  );
}
