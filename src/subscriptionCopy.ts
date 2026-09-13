/**
 * The subscription renewal date / auto-renew flag aren't returned by every
 * subscription endpoint under the same key (the admin-facing summary the
 * Home screen reads and the customer-facing list this feeds aren't
 * guaranteed to share a serializer), so read every spelling seen in this
 * codebase for this kind of field rather than a single hardcoded key.
 */
export type RenewalInfo = {
  endDate: Date | null;
  daysRemaining: number | null;
  autoRenew: boolean | null;
};

export const resolveRenewalInfo = (sub: any): RenewalInfo => {
  const rawDate =
    sub?.end_date ??
    sub?.next_billing_date ??
    sub?.renewal_date ??
    sub?.expiry_date ??
    sub?.expires_at ??
    sub?.valid_until ??
    sub?.current_period_end ??
    null;
  const parsedDate = rawDate ? new Date(rawDate) : null;
  const endDate = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : null;

  const rawDays = sub?.days_remaining ?? sub?.remaining_days ?? null;
  const daysRemaining =
    rawDays != null
      ? Number(rawDays)
      : endDate
      ? Math.ceil((endDate.getTime() - Date.now()) / 86400000)
      : null;

  const rawAutoRenew =
    sub?.auto_renew ?? sub?.is_auto_renew ?? sub?.autoRenew ?? sub?.renew_automatically ?? null;
  const autoRenew = typeof rawAutoRenew === "boolean" ? rawAutoRenew : null;

  return { endDate, daysRemaining, autoRenew };
};

// "0 days" / "-2 days" reads as broken — say it the way a person would.
export const daysRemainingCopy = (daysRemaining: number) => {
  if (daysRemaining < 0) return "Renewal overdue";
  if (daysRemaining === 0) return "Renews today";
  if (daysRemaining === 1) return "Renews tomorrow";
  return `Renews in ${daysRemaining} days`;
};
