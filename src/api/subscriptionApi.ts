import { apiGet, apiPost } from "./client";

export const getAvailablePlans = async () =>
  apiGet("/customer/subscriptions/plans");

export const getMySubscriptions = async () =>
  apiGet("/customer/subscriptions");

export const selectSubscription = async (planId: string) =>
  apiPost("/customer/select-subscription", { plan_id: planId });

export const requestSubscriptionCancellation = async (subId: string, reason?: string) =>
  apiPost(`/customer/subscriptions/${subId}/cancel-request`, { reason: reason ?? null });

// Report that the assigned maid was absent and ask the admin to credit the
// missed days back onto the subscription. Admin approves (extends) or rejects.
export const requestAbsenceCredit = async (
  subId: string,
  absenceDays: number,
  reason?: string
) =>
  apiPost(`/customer/subscriptions/${subId}/absence-credit-request`, {
    absence_days: absenceDays,
    reason: reason ?? null,
  });
