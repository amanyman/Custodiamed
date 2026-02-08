export type UserRole = "patient" | "provider";
export type InvitationStatus = "pending" | "accepted" | "expired" | "cancelled";
export type RelationshipStatus = "pending" | "active" | "inactive";
export type ShareStatus = "active" | "revoked" | "expired";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  date_of_birth: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: string;
  user_id: string;
  practice_name: string;
  specialty: string;
  npi_number: string;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invitation {
  id: string;
  provider_id: string;
  email: string;
  token: string;
  status: InvitationStatus;
  message: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface PatientProviderRelationship {
  id: string;
  patient_id: string;
  provider_id: string;
  status: RelationshipStatus;
  connected_at: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalFile {
  id: string;
  patient_id: string;
  study_id: string | null;
  original_filename: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  mime_type: string | null;
  dicom_metadata: Record<string, unknown> | null;
  study_date: string | null;
  modality: string | null;
  body_part: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface FileShare {
  id: string;
  file_id: string;
  patient_id: string;
  provider_id: string;
  status: ShareStatus;
  expires_at: string | null;
  provider_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImagingStudy {
  id: string;
  patient_id: string;
  study_date: string;
  modality: string;
  study_type: string | null;
  description: string | null;
  facility_name: string | null;
  facility_phone: string | null;
  facility_email: string | null;
  file_count: number;
  total_size: number;
  created_at: string;
  updated_at: string;
}

export interface ProviderInvitation {
  id: string;
  patient_id: string;
  study_id: string;
  provider_email: string;
  provider_name: string | null;
  message: string | null;
  token: string;
  status: InvitationStatus;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// Extended types for queries with joins
export interface PatientWithProfile extends Patient {
  profiles: Profile;
}

export interface ProviderWithProfile extends Provider {
  profiles: Profile;
}

export interface MedicalFileWithShares extends MedicalFile {
  file_shares: FileShare[];
}

export interface FileShareWithDetails extends FileShare {
  medical_files: MedicalFile;
  providers: ProviderWithProfile;
  patients: PatientWithProfile;
}

export interface InvitationWithProvider extends Invitation {
  providers: ProviderWithProfile;
}

export interface RelationshipWithDetails extends PatientProviderRelationship {
  patients: PatientWithProfile;
  providers: ProviderWithProfile;
}

// Database types for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      patients: {
        Row: Patient;
        Insert: Omit<Patient, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Patient, "id" | "created_at">>;
      };
      providers: {
        Row: Provider;
        Insert: Omit<Provider, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Provider, "id" | "created_at">>;
      };
      invitations: {
        Row: Invitation;
        Insert: Omit<Invitation, "id" | "token" | "created_at" | "updated_at">;
        Update: Partial<Omit<Invitation, "id" | "token" | "created_at">>;
      };
      patient_provider_relationships: {
        Row: PatientProviderRelationship;
        Insert: Omit<PatientProviderRelationship, "id" | "connected_at" | "created_at" | "updated_at">;
        Update: Partial<Omit<PatientProviderRelationship, "id" | "created_at">>;
      };
      medical_files: {
        Row: MedicalFile;
        Insert: Omit<MedicalFile, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<MedicalFile, "id" | "created_at">>;
      };
      imaging_studies: {
        Row: ImagingStudy;
        Insert: Omit<ImagingStudy, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ImagingStudy, "id" | "created_at">>;
      };
      provider_invitations: {
        Row: ProviderInvitation;
        Insert: Omit<ProviderInvitation, "id" | "token" | "created_at" | "updated_at">;
        Update: Partial<Omit<ProviderInvitation, "id" | "token" | "created_at">>;
      };
      file_shares: {
        Row: FileShare;
        Insert: Omit<FileShare, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<FileShare, "id" | "created_at">>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, "id" | "created_at">;
        Update: never;
      };
    };
    Enums: {
      user_role: UserRole;
      invitation_status: InvitationStatus;
      relationship_status: RelationshipStatus;
      share_status: ShareStatus;
    };
  };
}
