"use client"

import { getUsers, type User } from "@/lib/storage"

// Generate a random 8-digit alphanumeric access key
export function generateAccessKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate a random 10-digit alphanumeric master key
export function generateMasterKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate a username based on organization name and date
export function generateUsername(name: string, date: Date, index = 0): string {
  // Get first 3 letters of name (or less if name is shorter)
  const prefix = name.substring(0, 3).toUpperCase()

  // Get last 2 digits of year
  const year = date.getFullYear().toString().substring(2)

  // Generate a random 5-digit number
  const randomNum = Math.floor(10000 + Math.random() * 90000) + index

  return `${prefix}${year}${randomNum}`
}

// Create a new account
export async function createAccount(accountData: any): Promise<User> {
  // Get existing users
  const users = getUsers()

  // Create new user
  const newUser: User = {
    id: Math.random().toString(36).substring(2, 15),
    name: accountData.name,
    email: accountData.email,
    password: "password", // In a real app, this would be hashed
    role: accountData.accountType === "organization" ? "organization" : "individual",
    status: "active",
    createdAt: new Date().toISOString(),
    accountType: accountData.accountType,
    serviceType: accountData.serviceType,
    accessKey: accountData.accessKey,
    username: accountData.username,
    vehicles: accountData.vehicles,
    contactNumber: accountData.contactNumber,
    totalVehicles: accountData.totalVehicles,
  } as User

  // Add master key if organization
  if (accountData.accountType === "organization" && accountData.masterKey) {
    newUser.masterKey = accountData.masterKey
    newUser.contactPerson = accountData.contactPerson
    newUser.secondaryContactNumber = accountData.secondaryContactNumber
  }

  // Add to users array
  users.push(newUser)

  // Save to localStorage
  localStorage.setItem("users", JSON.stringify(users))

  return newUser
}

// Create an organization with multiple accounts
export async function createOrganizationWithAccounts(data: any): Promise<User> {
  // Get existing users
  const users = getUsers()

  // Create organization account
  const orgAccount: User = {
    id: Math.random().toString(36).substring(2, 15),
    name: data.name,
    email: data.email,
    password: "password", // In a real app, this would be hashed
    role: "organization",
    status: "active",
    createdAt: new Date().toISOString(),
    accountType: data.accountType,
    serviceType: data.serviceType,
    accessKey: data.accessKey,
    masterKey: data.masterKey,
    vehicles: data.vehicles,
    contactPerson: data.contactPerson,
    contactNumber: data.contactNumber,
    secondaryContactNumber: data.secondaryContactNumber,
    totalVehicles: data.totalVehicles,
  } as User

  // Add organization to users array
  users.push(orgAccount)

  // Create user accounts under the organization
  data.accounts.forEach((account: any) => {
    const userAccount: User = {
      id: Math.random().toString(36).substring(2, 15),
      name: `${data.name} User`,
      email: `${account.username.toLowerCase()}@${data.name.toLowerCase().replace(/\s+/g, "")}.com`,
      password: "password", // In a real app, this would be hashed
      role: "driver", // Default role
      status: "active",
      createdAt: new Date().toISOString(),
      organizationId: orgAccount.id,
      accountType: "individual",
      serviceType: data.serviceType,
      accessKey: account.accessKey,
      username: account.username,
    } as User

    users.push(userAccount)
  })

  // Save to localStorage
  localStorage.setItem("users", JSON.stringify(users))

  return orgAccount
}

// Regenerate access key for an account
export async function regenerateAccessKey(accountId: string): Promise<string> {
  // Get existing users
  const users = getUsers()

  // Find the account
  const accountIndex = users.findIndex((user) => user.id === accountId)

  if (accountIndex === -1) {
    throw new Error("Account not found")
  }

  // Generate new access key
  const newAccessKey = generateAccessKey()

  // Update the account
  users[accountIndex].accessKey = newAccessKey

  // Save to localStorage
  localStorage.setItem("users", JSON.stringify(users))

  return newAccessKey
}

// Regenerate master key for an organization
export async function regenerateMasterKey(accountId: string): Promise<string> {
  // Get existing users
  const users = getUsers()

  // Find the account
  const accountIndex = users.findIndex((user) => user.id === accountId)

  if (accountIndex === -1) {
    throw new Error("Account not found")
  }

  // Check if account is an organization
  if (users[accountIndex].accountType !== "organization") {
    throw new Error("Only organization accounts have master keys")
  }

  // Generate new master key
  const newMasterKey = generateMasterKey()

  // Update the account
  users[accountIndex].masterKey = newMasterKey

  // Save to localStorage
  localStorage.setItem("users", JSON.stringify(users))

  return newMasterKey
}

// Delete an account
export async function deleteAccount(accountId: string): Promise<void> {
  // Get existing users
  const users = getUsers()

  // Find the account
  const account = users.find((user) => user.id === accountId)

  if (!account) {
    throw new Error("Account not found")
  }

  // If organization, delete all accounts under it
  if (account.accountType === "organization") {
    const filteredUsers = users.filter((user) => user.id !== accountId && user.organizationId !== accountId)
    localStorage.setItem("users", JSON.stringify(filteredUsers))
  } else {
    // Just delete the individual account
    const filteredUsers = users.filter((user) => user.id !== accountId)
    localStorage.setItem("users", JSON.stringify(filteredUsers))
  }
}

// Toggle account status (enable/disable)
export async function toggleAccountStatus(accountId: string, status: "active" | "disabled"): Promise<void> {
  // Get existing users
  const users = getUsers()

  // Find the account
  const accountIndex = users.findIndex((user) => user.id === accountId)

  if (accountIndex === -1) {
    throw new Error("Account not found")
  }

  // Update the account status
  users[accountIndex].status = status

  // If organization, update all accounts under it
  if (users[accountIndex].accountType === "organization") {
    users.forEach((user, index) => {
      if (user.organizationId === accountId) {
        users[index].status = status
      }
    })
  }

  // Save to localStorage
  localStorage.setItem("users", JSON.stringify(users))
}
