import { apiGet, apiPost } from "./client";

export const getAvailablePlans = async () =>
  apiGet("/customer/subscriptions/plans");

export const getMySubscriptions = async () =>
  apiGet("/customer/subscriptions");

export const selectSubscription = async (planId: string) =>
  apiPost("/customer/select-subscription", { plan_id: planId });

export const requestSubscriptionCancellation = async (subId: string) =>
  apiPost(`/customer/subscriptions/${subId}/cancel-request`);
