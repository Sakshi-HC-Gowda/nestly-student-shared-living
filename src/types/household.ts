export type HouseholdType = 'Shared Apartment' | 'PG' | 'Hostel' | 'Other'

export type MemberRole = 'OWNER' | 'MEMBER'

export interface HouseholdMember {
  id: string
  userId: string
  name: string
  role: MemberRole
  joinedAt: string
}

export interface Household {
  id: string
  name: string
  type: HouseholdType
  inviteCode: string
  members: HouseholdMember[]
  createdAt: string
}

export interface CreateHouseholdInput {
  name: string
  type: HouseholdType
}

export type InvitationStatus = 'Pending' | 'Accepted' | 'Expired' | 'Cancelled'

export interface Invitation {
  id: string
  householdId: string
  email: string
  status: InvitationStatus
  sentAt: string
}
