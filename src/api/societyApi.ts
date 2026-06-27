import { apiGet } from "./client";

export type SocietyInfo = {
  societyName: string | null;
  towerName: string | null;
  address: string | null;
};

/**
 * Resolve human-readable society / tower names.
 *
 * Why this exists: the customer's cached login payload and `/customer/profile`
 * reliably carry only **IDs** (`society_id` / `tower_id`); the `society_name` /
 * `tower_name` fields are nullable and are frequently NOT populated by the API
 * for admin-pre-registered residents. So when a name is missing we resolve it
 * from the ID via the society-list + towers endpoints, which always carry names.
 *
 * Pass any names you already have (e.g. from the profile response) — they're used
 * as-is and short-circuit the extra calls.
 */
export async function resolveSocietyInfo(opts: {
  societyId?: string | null;
  towerId?: string | null;
  societyName?: string | null;
  towerName?: string | null;
}): Promise<SocietyInfo> {
  const societyId = opts.societyId ? String(opts.societyId) : null;
  const towerId = opts.towerId ? String(opts.towerId) : null;

  let societyName = opts.societyName?.trim() || null;
  let towerName = opts.towerName?.trim() || null;
  let address: string | null = null;

  // Resolve society name + address from the id.
  if (societyId && !societyName) {
    try {
      const json: any = await apiGet(`/customer/societies?limit=1000`);
      const list: any[] = json?.data?.societies ?? json?.societies ?? (Array.isArray(json?.data) ? json.data : []);
      const match = list.find((s) => String(s?.id) === societyId);
      if (match) {
        societyName = match.name ?? null;
        address = match.address ?? null;
      }
    } catch {}
  }

  // Resolve tower name from the id (towers are scoped to a society).
  if (societyId && towerId && !towerName) {
    try {
      const json: any = await apiGet(`/customer/societies/${societyId}/towers`);
      const towers: any[] = json?.data ?? json?.towers ?? (Array.isArray(json) ? json : []);
      const match = towers.find((t) => String(t?.id) === towerId);
      if (match) towerName = match.name ?? match.tower_name ?? null;
    } catch {}
  }

  return { societyName, towerName, address };
}

export type Residence = {
  firstName: string | null;
  phone: string | null;
  profileImage: string | null;
  societyId: string | null;
  towerId: string | null;
  flatNumber: string | null;
  societyName: string | null;
  towerName: string | null;
  address: string | null;
};

/**
 * Single source of truth for "where does this customer live": pulls the customer
 * profile, falls back to the resident record for the society/tower/flat ids when
 * the base customer row doesn't carry them (admin can assign a resident to a
 * society without the id landing on the customer object), then resolves the
 * human-readable names. Used by the dashboard greeting + the Account screen.
 */
export async function getMyResidence(): Promise<Residence> {
  let p: any = {};
  try {
    const j: any = await apiGet(`/customer/profile`);
    p = j?.data ?? j ?? {};
  } catch {}

  let societyId: string | null = p.society_id ? String(p.society_id) : null;
  let towerId: string | null = p.tower_id ? String(p.tower_id) : null;
  let flatNumber: string | null = p.flat_number ? String(p.flat_number) : null;
  let societyName: string | null = p.society_name || null;
  let towerName: string | null = p.tower_name || null;

  // The resident record is what admin edits ("full address"); consult it when the
  // customer object is missing the residence ids/names.
  if (!societyId || !flatNumber) {
    try {
      const r: any = await apiGet(`/customer/profile/resident`);
      const rd = r?.data ?? r ?? {};
      societyId = societyId || (rd.society_id ? String(rd.society_id) : null);
      towerId = towerId || (rd.tower_id ? String(rd.tower_id) : null);
      flatNumber = flatNumber || (rd.flat_number ? String(rd.flat_number) : null);
      societyName = societyName || rd.society_name || null;
      towerName = towerName || rd.tower_name || null;
    } catch {}
  }

  const info = await resolveSocietyInfo({ societyId, towerId, societyName, towerName });

  return {
    firstName: p.first_name || null,
    phone: p.phone || p.mobile || null,
    profileImage: p.profile_image || null,
    societyId,
    towerId,
    flatNumber,
    societyName: info.societyName,
    towerName: info.towerName,
    address: info.address,
  };
}
