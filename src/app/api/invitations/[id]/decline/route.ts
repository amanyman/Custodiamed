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

  // Update invitation status
  const { error } = await supabase
    .from("invitations")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("email", user.email);

  if (error) {
    return NextResponse.redirect(
      new URL("/patient/providers?error=failed", request.url)
    );
  }

  return NextResponse.redirect(
    new URL("/patient/providers?success=declined", request.url)
  );
}
