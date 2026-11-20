import type { SupabaseClient } from '@supabase/supabase-js';
import type { BeverageMenu, Database } from '@/types/database';
import type { MenuSection } from '@/types/menu';

/**
 * Which beverage menu customers currently see: the Party menu while the
 * admin switch (app_settings.party_menu_enabled) is on, the All Day menu
 * otherwise. Food categories (beverage_menu = null) are shown either way.
 */
export async function getActiveBeverageMenu(supabase: SupabaseClient<Database>): Promise<BeverageMenu> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('party_menu_enabled')
    .eq('id', true)
    .maybeSingle();
  if (error) throw error;
  return data?.party_menu_enabled ? 'party' : 'all_day';
}

/** True when a category with this beverage_menu is visible to customers. */
export function isCategoryVisible(categoryMenu: BeverageMenu | null, activeMenu: BeverageMenu): boolean {
  return categoryMenu === null || categoryMenu === activeMenu;
}

/** Drops the categories of whichever beverage menu is switched off, and any section left empty. */
export function filterSectionsForBeverageMenu(sections: MenuSection[], activeMenu: BeverageMenu): MenuSection[] {
  return sections
    .map((s) => ({ ...s, categories: s.categories.filter((c) => isCategoryVisible(c.beverageMenu, activeMenu)) }))
    .filter((s) => s.categories.length > 0);
}
