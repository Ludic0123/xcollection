import { createClient } from '@/lib/supabase/server'

export async function fetchSpotMasters() {
  const supabase = await createClient()
  const [
    { data: genres, error: error1 },
    { data: cities, error: error2 },
    { data: priceRanges, error: error3 },
    { data: reservations, error: error4 },
    { data: chefs, error: error5 },
    { data: ingredients, error: error6 },
  ] = await Promise.all([
    supabase
      .from('master_genres')
      .select('id, category, name')
      .order('category')
      .order('display_order'),
    supabase
      .from('master_cities')
      .select('id, name, prefecture')
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
    supabase
      .from('master_ingredients')
      .select('genre, name')
      .order('genre')
      .order('display_order')
      .order('name'),
  ])
  const error = [error1, error2, error3, error4, error5, error6].find(Boolean)
  if (error) throw new Error('選択肢を取得できませんでした: ' + error.message)
  return {
    genres: genres ?? [],
    cities: cities ?? [],
    priceRanges: priceRanges ?? [],
    reservations: reservations ?? [],
    chefs: chefs ?? [],
    ingredients: ingredients ?? [],
  }
}

export async function fetchSakeMasters() {
  const supabase = await createClient()
  const [
    { data: sakeTypes, error: error7 },
    { data: sakeBrands, error: error8 },
    { data: sakeModels, error: error9 },
  ] = await Promise.all([
    supabase.from('master_sake_types').select('id, name').order('display_order'),
    supabase.from('master_sake_brands').select('id, name').order('display_order'),
    supabase.from('master_sake_models').select('id, name').order('display_order'),
  ])
  const error = [error7, error8, error9].find(Boolean)
  if (error) throw new Error('選択肢を取得できませんでした: ' + error.message)
  return {
    sakeTypes: sakeTypes ?? [],
    sakeBrands: sakeBrands ?? [],
    sakeModels: sakeModels ?? [],
  }
}

export async function fetchHotelMasters() {
  const supabase = await createClient()
  const [
    { data: brands, error: error10 },
    { data: priceRanges, error: error11 },
    { data: reservations, error: error12 },
  ] = await Promise.all([
    supabase.from('master_hotel_brands').select('id, name').order('display_order'),
    supabase.from('master_price_ranges').select('level, label').order('level'),
    supabase.from('master_reservation_methods').select('value, label').order('display_order'),
  ])
  const error = [error10, error11, error12].find(Boolean)
  if (error) throw new Error('選択肢を取得できませんでした: ' + error.message)
  return {
    brands: brands ?? [],
    priceRanges: priceRanges ?? [],
    reservations: reservations ?? [],
  }
}
