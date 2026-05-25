import { createClient } from '@/lib/supabase/server'

export async function fetchSpotMasters() {
  const supabase = await createClient()
  const [
    { data: genres },
    { data: cities },
    { data: priceRanges },
    { data: reservations },
    { data: chefs },
  ] = await Promise.all([
    supabase
      .from('master_genres')
      .select('id, category, name')
      .order('category')
      .order('display_order'),
    supabase
      .from('master_cities')
      .select('id, name')
      .order('display_order'),
    supabase
      .from('master_price_ranges')
      .select('level, label')
      .order('level'),
    supabase
      .from('master_reservation_methods')
      .select('value, label')
      .order('display_order'),
    supabase
      .from('chefs')
      .select('id, name, specialty')
      .order('name'),
  ])
  return {
    genres: genres ?? [],
    cities: cities ?? [],
    priceRanges: priceRanges ?? [],
    reservations: reservations ?? [],
    chefs: chefs ?? [],
  }
}

export async function fetchSakeMasters() {
  const supabase = await createClient()
  const [
    { data: sakeTypes },
    { data: sakeBrands },
    { data: sakeModels },
  ] = await Promise.all([
    supabase.from('master_sake_types').select('id, name').order('display_order'),
    supabase.from('master_sake_brands').select('id, name').order('display_order'),
    supabase.from('master_sake_models').select('id, name').order('display_order'),
  ])
  return {
    sakeTypes: sakeTypes ?? [],
    sakeBrands: sakeBrands ?? [],
    sakeModels: sakeModels ?? [],
  }
}

export async function fetchHotelMasters() {
  const supabase = await createClient()
  const [
    { data: brands },
    { data: priceRanges },
    { data: reservations },
  ] = await Promise.all([
    supabase.from('master_hotel_brands').select('id, name').order('display_order'),
    supabase.from('master_price_ranges').select('level, label').order('level'),
    supabase.from('master_reservation_methods').select('value, label').order('display_order'),
  ])
  return {
    brands: brands ?? [],
    priceRanges: priceRanges ?? [],
    reservations: reservations ?? [],
  }
}
