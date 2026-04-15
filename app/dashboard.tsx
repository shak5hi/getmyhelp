/* PRODUCTION ARCHITECTURE UPGRADE — backward-compat redirect */
import { Redirect } from "expo-router";

/**
 * Old /dashboard route — redirects to the Home tab.
 * Preserved so any existing links or history entries still work.
 */
export default function DashboardRedirect() {
  return <Redirect href="/(tabs)/home" />;
}
/* END PRODUCTION ARCHITECTURE UPGRADE */