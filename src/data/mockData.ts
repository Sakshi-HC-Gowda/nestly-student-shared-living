import type { User } from '@/types/auth'
import type { Household, Invitation } from '@/types/household'
import type { Expense } from '@/types/expense'
import type { Bill } from '@/types/bill'
import type { Chore } from '@/types/chore'
import type { ActivityItem } from '@/types/activity'
import type { GroceryItem } from '@/types/grocery'
import type { Notification } from '@/types/notification'

/**
 * Single source of mock data for the whole app. Nothing else should hold
 * hardcoded users/households/etc. — pages and contexts always go through
 * the `api/` layer, which reads and (for the session) mutates this store.
 * Shapes mirror what the Week 4 Spring Boot DTOs are expected to return.
 */

export const mockUsers: User[] = [
  { id: 'u1', name: 'Sakshi', email: 'sakshi@nestly.app' },
  { id: 'u2', name: 'Rahul', email: 'rahul@nestly.app' },
  { id: 'u3', name: 'Ananya', email: 'ananya@nestly.app' },
  { id: 'u4', name: 'Priya', email: 'priya@nestly.app' },
]

export const mockHouseholds: Household[] = [
  {
    id: 'h1',
    name: 'Green Nest',
    type: 'Shared Apartment',
    inviteCode: 'GRNNST',
    createdAt: '2026-05-12T09:00:00.000Z',
    members: [
      { id: 'm1', userId: 'u1', name: 'Sakshi', role: 'OWNER', joinedAt: '2026-05-12T09:00:00.000Z' },
      { id: 'm2', userId: 'u2', name: 'Rahul', role: 'MEMBER', joinedAt: '2026-05-14T10:30:00.000Z' },
      { id: 'm3', userId: 'u3', name: 'Ananya', role: 'MEMBER', joinedAt: '2026-05-15T18:15:00.000Z' },
      { id: 'm4', userId: 'u4', name: 'Priya', role: 'MEMBER', joinedAt: '2026-05-20T12:00:00.000Z' },
    ],
  },
  {
    id: 'h2',
    name: 'Hostel Room',
    type: 'Hostel',
    inviteCode: 'HSTL42',
    createdAt: '2026-06-01T09:00:00.000Z',
    members: [
      { id: 'm5', userId: 'u1', name: 'Sakshi', role: 'OWNER', joinedAt: '2026-06-01T09:00:00.000Z' },
      { id: 'm6', userId: 'u2', name: 'Rahul', role: 'MEMBER', joinedAt: '2026-06-02T09:00:00.000Z' },
    ],
  },
]

/** Maps a userId to the household ids they belong to. */
export const membershipIndex: Record<string, string[]> = {
  u1: ['h1', 'h2'],
  u2: ['h1', 'h2'],
  u3: ['h1'],
  u4: ['h1'],
}

/** The signed-in demo user for Week 2's mock authentication. */
export const DEMO_USER_ID = 'u1'

export const mockInvitations: Invitation[] = [
  {
    id: 'inv1',
    householdId: 'h1',
    email: 'priya.roomie@example.com',
    status: 'Accepted',
    sentAt: '2026-05-20T11:00:00.000Z',
  },
  {
    id: 'inv2',
    householdId: 'h1',
    email: 'newroomie@example.com',
    status: 'Pending',
    sentAt: '2026-08-18T09:30:00.000Z',
  },
]

// Green Nest (h1) members, for reference while reading the shares below:
// u1 Sakshi (OWNER), u2 Rahul, u3 Ananya, u4 Priya

export const mockExpenses: Expense[] = [
  {
    id: 'e1',
    householdId: 'h1',
    amount: 1200,
    description: 'Grocery run',
    category: 'Groceries',
    paidByUserId: 'u1',
    paidByName: 'Sakshi',
    participantIds: ['u1', 'u2', 'u3', 'u4'],
    splitMethod: 'Equal',
    shares: { u1: 300, u2: 300, u3: 300, u4: 300 },
    date: '2026-08-20T10:00:00.000Z',
  },
  {
    id: 'e2',
    householdId: 'h1',
    amount: 800,
    description: 'Electricity advance',
    category: 'Utilities',
    paidByUserId: 'u1',
    paidByName: 'Sakshi',
    participantIds: ['u1', 'u2', 'u3', 'u4'],
    splitMethod: 'Equal',
    shares: { u1: 200, u2: 200, u3: 200, u4: 200 },
    date: '2026-08-15T09:00:00.000Z',
  },
  {
    id: 'e3',
    householdId: 'h1',
    amount: 600,
    description: 'Dinner out',
    category: 'Food',
    paidByUserId: 'u3',
    paidByName: 'Ananya',
    participantIds: ['u1', 'u3', 'u4'],
    splitMethod: 'Equal',
    shares: { u1: 200, u3: 200, u4: 200 },
    date: '2026-08-18T19:30:00.000Z',
    notes: 'Rahul was out of town',
  },
  {
    id: 'e4',
    householdId: 'h1',
    amount: 960,
    description: 'Weekend groceries',
    category: 'Groceries',
    paidByUserId: 'u4',
    paidByName: 'Priya',
    participantIds: ['u1', 'u2', 'u3', 'u4'],
    splitMethod: 'Equal',
    shares: { u1: 240, u2: 240, u3: 240, u4: 240 },
    date: '2026-08-10T12:00:00.000Z',
  },
  {
    id: 'e5',
    householdId: 'h1',
    amount: 240,
    description: 'Auto fare shared',
    category: 'Transport',
    paidByUserId: 'u1',
    paidByName: 'Sakshi',
    participantIds: ['u1', 'u2'],
    splitMethod: 'Equal',
    shares: { u1: 120, u2: 120 },
    date: '2026-08-21T08:15:00.000Z',
  },
  {
    id: 'e6',
    householdId: 'h1',
    amount: 2000,
    description: 'July groceries',
    category: 'Groceries',
    paidByUserId: 'u2',
    paidByName: 'Rahul',
    participantIds: ['u1', 'u2', 'u3', 'u4'],
    splitMethod: 'Equal',
    shares: { u1: 500, u2: 500, u3: 500, u4: 500 },
    date: '2026-07-25T12:00:00.000Z',
  },
]

export const mockBills: Bill[] = [
  {
    id: 'b1',
    householdId: 'h1',
    title: 'Electricity',
    amount: 3240,
    dueDate: '2026-08-25T00:00:00.000Z',
    category: 'Electricity',
    participantIds: ['u1', 'u2', 'u3', 'u4'],
    splitMethod: 'Equal',
    shares: { u1: 810, u2: 810, u3: 810, u4: 810 },
    recurring: true,
    status: 'Upcoming',
  },
  {
    id: 'b2',
    householdId: 'h1',
    title: 'Wi-Fi',
    amount: 1200,
    dueDate: '2026-08-28T00:00:00.000Z',
    category: 'Internet',
    participantIds: ['u1', 'u2', 'u3', 'u4'],
    splitMethod: 'Equal',
    shares: { u1: 300, u2: 300, u3: 300, u4: 300 },
    recurring: true,
    status: 'Upcoming',
  },
  {
    id: 'b3',
    householdId: 'h1',
    title: 'Water',
    amount: 580,
    dueDate: '2026-08-10T00:00:00.000Z',
    category: 'Water',
    participantIds: ['u1', 'u2', 'u3', 'u4'],
    splitMethod: 'Equal',
    shares: { u1: 145, u2: 145, u3: 145, u4: 145 },
    recurring: false,
    status: 'Overdue',
  },
  {
    id: 'b4',
    householdId: 'h1',
    title: 'Rent',
    amount: 24000,
    dueDate: '2026-08-01T00:00:00.000Z',
    category: 'Rent',
    participantIds: ['u1', 'u2', 'u3', 'u4'],
    splitMethod: 'Equal',
    shares: { u1: 6000, u2: 6000, u3: 6000, u4: 6000 },
    recurring: true,
    status: 'Paid',
  },
]

export const mockChores: Chore[] = [
  {
    id: 'c1',
    householdId: 'h1',
    title: 'Clean kitchen',
    assignedToUserId: 'u2',
    assignedToName: 'Rahul',
    dueDate: '2026-08-23T00:00:00.000Z',
    frequency: 'Weekly',
    status: 'Pending',
  },
  {
    id: 'c2',
    householdId: 'h1',
    title: 'Take out trash',
    assignedToUserId: 'u1',
    assignedToName: 'Sakshi',
    dueDate: '2026-08-23T00:00:00.000Z',
    frequency: 'Daily',
    status: 'Pending',
  },
  {
    id: 'c3',
    householdId: 'h1',
    title: 'Vacuum living room',
    assignedToUserId: 'u3',
    assignedToName: 'Ananya',
    dueDate: '2026-08-24T00:00:00.000Z',
    frequency: 'Weekly',
    status: 'Pending',
  },
  {
    id: 'c4',
    householdId: 'h1',
    title: 'Mop bathroom',
    assignedToUserId: 'u4',
    assignedToName: 'Priya',
    dueDate: '2026-08-21T00:00:00.000Z',
    frequency: 'Weekly',
    status: 'Overdue',
  },
]

export const mockGroceryItems: GroceryItem[] = [
  { id: 'g1', householdId: 'h1', name: 'Milk', quantity: '2 L', purchased: false, addedByUserId: 'u1', addedByName: 'Sakshi' },
  { id: 'g2', householdId: 'h1', name: 'Rice', quantity: '5 kg', purchased: false, addedByUserId: 'u2', addedByName: 'Rahul' },
  { id: 'g3', householdId: 'h1', name: 'Eggs', quantity: '12', purchased: true, addedByUserId: 'u1', addedByName: 'Sakshi' },
  { id: 'g4', householdId: 'h1', name: 'Bread', purchased: false, addedByUserId: 'u3', addedByName: 'Ananya' },
  {
    id: 'g5',
    householdId: 'h1',
    name: 'Dishwashing liquid',
    note: 'The unscented one',
    purchased: false,
    addedByUserId: 'u4',
    addedByName: 'Priya',
  },
]

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    householdId: 'h1',
    userId: 'u1',
    type: 'chore',
    message: 'Your kitchen chore is due today',
    createdAt: '2026-08-23T07:00:00.000Z',
    read: false,
  },
  {
    id: 'n2',
    householdId: 'h1',
    userId: 'u1',
    type: 'bill',
    message: 'Electricity bill due tomorrow',
    createdAt: '2026-08-24T09:00:00.000Z',
    read: false,
  },
  {
    id: 'n3',
    householdId: 'h1',
    userId: 'u1',
    type: 'expense',
    message: 'You owe ₹400',
    createdAt: '2026-08-19T17:20:00.000Z',
    read: false,
  },
  {
    id: 'n4',
    householdId: 'h1',
    userId: 'u1',
    type: 'expense',
    message: 'Priya added a ₹960 groceries expense',
    createdAt: '2026-08-10T12:05:00.000Z',
    read: true,
  },
  {
    id: 'n5',
    householdId: 'h1',
    userId: 'u1',
    type: 'invitation',
    message: 'You were invited to Green Nest',
    createdAt: '2026-05-12T09:05:00.000Z',
    read: true,
  },
]

export const mockActivity: ActivityItem[] = [
  {
    id: 'a1',
    householdId: 'h1',
    type: 'expense',
    message: 'Sakshi added ₹1,200 grocery expense',
    timestamp: '2026-08-20T10:05:00.000Z',
  },
  {
    id: 'a2',
    householdId: 'h1',
    type: 'settlement',
    message: 'Ananya settled ₹400',
    timestamp: '2026-08-19T17:20:00.000Z',
  },
  {
    id: 'a3',
    householdId: 'h1',
    type: 'chore',
    message: 'Kitchen cleaning assigned to Rahul',
    timestamp: '2026-08-18T09:00:00.000Z',
  },
  {
    id: 'a4',
    householdId: 'h1',
    type: 'invitation',
    message: 'Priya accepted the invitation to Green Nest',
    timestamp: '2026-05-20T11:05:00.000Z',
  },
]
