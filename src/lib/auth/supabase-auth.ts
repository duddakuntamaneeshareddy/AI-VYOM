import { createServerSupabaseClient } from '@/lib/db/supabase-server'
import { Profile } from '@/lib/db/types'

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

export async function getUserProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !data) {
    return null
  }

  return data as Profile
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await getUserProfile()

  if (!profile) {
    throw new Error('Unauthorized')
  }

  if (profile.role !== 'admin') {
    throw new Error('Forbidden: admin access required')
  }

  return profile
}

export async function requireRetailer(): Promise<Profile> {
  const profile = await getUserProfile()

  if (!profile) {
    throw new Error('Unauthorized')
  }

  if (profile.role !== 'retailer') {
    throw new Error('Forbidden: retailer access required')
  }

  return profile
}
