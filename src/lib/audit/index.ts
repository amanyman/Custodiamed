import { createClient } from "@/lib/supabase/client";

export type AuditAction =
  | "file.upload"
  | "file.view"
  | "file.download"
  | "file.delete"
  | "share.create"
  | "share.revoke"
  | "share.view"
  | "invitation.create"
  | "invitation.accept"
  | "relationship.create"
  | "relationship.disconnect"
  | "profile.update"
  | "auth.login"
  | "auth.logout";

export type ResourceType =
  | "medical_file"
  | "file_share"
  | "invitation"
  | "relationship"
  | "profile";

interface AuditLogParams {
  action: AuditAction;
  resourceType: ResourceType;
  resourceId?: string;
  details?: Record<string, unknown>;
}

export async function createAuditLog({
  action,
  resourceType,
  resourceId,
  details,
}: AuditLogParams): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.warn("Audit log attempted without authenticated user");
    return;
  }

  const { error } = await supabase.from("audit_logs").insert({
    user_id: user.id,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details,
  });

  if (error) {
    console.error("Failed to create audit log:", error);
  }
}

export async function createServerAuditLog(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  params: AuditLogParams
): Promise<void> {
  const { error } = await supabase.from("audit_logs").insert({
    user_id: userId,
    action: params.action,
    resource_type: params.resourceType,
    resource_id: params.resourceId,
    details: params.details,
  });

  if (error) {
    console.error("Failed to create audit log:", error);
  }
}
