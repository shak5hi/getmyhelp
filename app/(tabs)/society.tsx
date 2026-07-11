import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// NOTE: edges={["bottom"]} — expo-router tab screens already sit below the status bar,
// so we only need bottom safe area for the home indicator.
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../../src/config";
import { fonts } from "../../constants/tokens";
import { makeStyles } from "../../styles/society.styles";
import { useTheme } from "../../src/ThemeContext";
import SegmentedControl from "../../components/ui/SegmentedControl";
import { TransactionCard } from "../../components/society/TransactionCard";
import { TicketCard } from "../../components/society/TicketCard";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { useFeature } from "../../src/FeatureContext";
import { MODULES } from "../../src/featureRegistry";
import { getToken } from "../../src/api/tokenStore";

type ActiveTab = "finance" | "tickets";
type FinanceType = "income" | "expense";

const toNumber = (value: any) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeFinanceType = (value: any): FinanceType => {
  const raw = String(value || "").toLowerCase();
  if (
    raw.includes("income") ||
    raw.includes("credit") ||
    raw === "cr" ||
    raw.includes("inflow") ||
    raw.includes("receipt")
  ) {
    return "income";
  }
  return "expense";
};

const extractFinanceRows = (json: any) => {
  const candidates = [
    json?.data?.transactions,
    json?.data?.finance,
    json?.data?.items,
    json?.transactions,
    json?.finance,
    json?.items,
    Array.isArray(json?.data) ? json.data : null,
    Array.isArray(json) ? json : null,
  ];

  const rows = candidates.find((candidate) => Array.isArray(candidate)) || [];

  return rows.map((item: any, index: number) => {
    const amount = toNumber(
      item?.amount ??
      item?.total_amount ??
      item?.transaction_amount ??
      item?.value
    );
    const date =
      item?.transaction_datetime ||
      item?.transactionDate ||
      item?.date ||
      item?.created_at ||
      item?.createdAt ||
      new Date().toISOString();
    const categoryName =
      item?.category?.name ||
      item?.category_name ||
      item?.category ||
      item?.head?.name ||
      item?.title ||
      "Society Dues";
    const type = normalizeFinanceType(
      item?.type ??
      item?.transaction_type ??
      item?.transactionType ??
      item?.kind ??
      item?.entry_type
    );
    const attachments = item?.attachments || item?.files || item?.documents || [];

    return {
      id:
        item?.id ||
        item?.transaction_id ||
        item?.reference_id ||
        `finance-${index}-${String(date)}`,
      amount,
      date,
      category: categoryName,
      type,
      note: item?.description || item?.note || item?.remarks || item?.narration,
      attachments: Array.isArray(attachments) ? attachments : [],
      hasAttachment: Array.isArray(attachments) ? attachments.length > 0 : Boolean(attachments),
    };
  });
};

export default function SocietyScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  // This screen hosts two independent modules. Either can be switched off per
  // society in admin, so the segments — and which tab we land on — are derived
  // from the enabled set rather than hard-coded.
  const financeEnabled = useFeature(MODULES.finance);
  const ticketsEnabled = useFeature(MODULES.tickets);
  const noneEnabled = !financeEnabled && !ticketsEnabled;

  const [activeTab, setActiveTab] = useState<ActiveTab>("finance");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

  // Keep the active tab on an enabled module. Covers the initial landing (the
  // default is "finance", which may be off) and a mid-session module change.
  useEffect(() => {
    if (activeTab === "finance" && !financeEnabled && ticketsEnabled) setActiveTab("tickets");
    else if (activeTab === "tickets" && !ticketsEnabled && financeEnabled) setActiveTab("finance");
  }, [activeTab, financeEnabled, ticketsEnabled]);

  const fetchData = useCallback(async (isRefresh = false) => {
    // Don't call an endpoint for a module this society has switched off — it
    // would 403 and surface as an error state for a feature that shouldn't exist.
    if (noneEnabled) {
      setLoading(false);
      setRefreshing(false);
      setData([]);
      return;
    }
    if (activeTab === "finance" && !financeEnabled) return;
    if (activeTab === "tickets" && !ticketsEnabled) return;

    if (!isRefresh) setLoading(true);
    setError(false);
    try {
      const token = await getToken();
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      if (!token || !user?.id) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (activeTab === "finance") {
        const response = await fetch(`${config.apiUrl}/customer/society/finance`, { headers });
        
        if (!response.ok) {
          throw new Error(`Finance server error: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           const text = await response.text();
           console.error("Finance non-JSON response:", text);
           throw new Error("Invalid finance response format");
        }

        const json = await response.json();
        setData(extractFinanceRows(json));
      } else {
        const response = await fetch(`${config.apiUrl}/customer/tickets`, { headers });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Tickets fetch failed with status ${response.status}:`, errorText.substring(0, 500));
          throw new Error(`Tickets server error: ${response.status}`);
        }

        const json = await response.json();

        let ticketList: any[] = [];
        if (json.data && Array.isArray(json.data.tickets)) ticketList = json.data.tickets;
        else if (Array.isArray(json.tickets)) ticketList = json.tickets;
        else if (Array.isArray(json.data)) ticketList = json.data;
        else if (Array.isArray(json)) ticketList = json;

        setData(ticketList);
      }
    } catch (err) {
      console.error(`Error fetching ${activeTab}:`, err);
      setError(true);
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }

  }, [activeTab, financeEnabled, ticketsEnabled, noneEnabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const openAttachment = async (url: string) => {
    try {
      const fullUrl = url.startsWith("http") ? url : `${config.fileBaseUrl}${url}`;
      await WebBrowser.openBrowserAsync(fullUrl, {
        toolbarColor: theme.surface,
        enableBarCollapsing: true,
        showTitle: true,
      });
    } catch (err) {
      console.error("Could not open attachment", err);
    }
  };

  const renderTabs = () => {
    // Nothing to head the list with when the society has neither module.
    if (noneEnabled) return null;

    // Finance summary totals
    const totalIncome  = activeTab === "finance" ? data.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + t.amount, 0) : 0;
    const totalExpense = activeTab === "finance" ? data.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + t.amount, 0) : 0;

    // Only offer the modules this society actually has. With just one enabled a
    // two-segment control would be a lie, so it isn't rendered at all.
    const tabs: { key: ActiveTab; label: string }[] = [
      financeEnabled && { key: "finance" as const, label: "Finances" },
      ticketsEnabled && { key: "tickets" as const, label: "Support" },
    ].filter(Boolean) as { key: ActiveTab; label: string }[];

    return (
      <>
        {tabs.length > 1 && (
          <View style={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 }}>
            <SegmentedControl
              segments={tabs.map((t) => t.label)}
              value={tabs.findIndex((t) => t.key === activeTab)}
              onChange={(i) => setActiveTab(tabs[i].key)}
            />
          </View>
        )}

        {/* Make the two distinct mental models explicit: money vs. issues. */}
        <Text style={styles.tabCaption}>
          {activeTab === "finance"
            ? "Your society's income & expense ledger."
            : "Raise and track issues with building management."}
        </Text>

        {/* Finance summary cards */}
        {activeTab === "finance" && !loading && data.length > 0 && (
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: theme.successTint, borderWidth: 0 }]}>
              <View style={[styles.summaryIconWrap, { backgroundColor: theme.success + "22" }]}>
                <Ionicons name="arrow-down-circle" size={18} color={theme.success} />
              </View>
              <Text style={[styles.summaryLabel, { color: theme.success }]}>Total Income</Text>
              <Text style={[styles.summaryValue, { color: theme.success }]}>
                ₹{totalIncome.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: theme.dangerTint, borderWidth: 0 }]}>
              <View style={[styles.summaryIconWrap, { backgroundColor: theme.danger + "22" }]}>
                <Ionicons name="arrow-up-circle" size={18} color={theme.danger} />
              </View>
              <Text style={[styles.summaryLabel, { color: theme.danger }]}>Total Expenses</Text>
              <Text style={[styles.summaryValue, { color: theme.danger }]}>
                ₹{totalExpense.toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {/* Count strip */}
        {!loading && data.length > 0 && (
          <View style={styles.countStrip}>
            <Text style={[styles.countStripText, { color: theme.textTertiary }]}>
              {data.length} {activeTab === "finance" ? "transactions" : "tickets"}
            </Text>
          </View>
        )}
      </>
    );
  };

  const renderLoading = () => (
    <View style={{ padding: 20 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} height={80} style={{ marginBottom: 12, borderRadius: 16 }} />
      ))}
    </View>
  );

  const renderEmpty = () => {
    // Both modules off for this society — the tab exists but has no content.
    if (noneEnabled) {
      return (
        <EmptyState
          title="Nothing here yet"
          message="Your society hasn't enabled any of these features."
          icon="business-outline"
        />
      );
    }
    return renderEmptyForTab();
  };

  const renderEmptyForTab = () => (
    <EmptyState
      title={activeTab === "finance" ? "No Transactions" : "No Support Tickets"}
      message={activeTab === "finance"
        ? "You haven't made any transactions yet. Your billing history will appear here."
        : "Everything looks good! If you have any issues, feel free to raise a ticket."}
      icon={activeTab === "finance" ? "card-outline" : "chatbubbles-outline"}
      actionText={activeTab === "tickets" ? "Raise Request" : undefined}
      onAction={activeTab === "tickets" ? () => router.push("/society/create-ticket") : undefined}
    />
  );

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Fixed top header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 26, paddingBottom: 8, backgroundColor: theme.bg }}>
        <Text style={{ fontSize: 26, fontFamily: fonts.extrabold, color: theme.text, letterSpacing: -0.5 }}>
          Society
        </Text>
      </View>

      <FlatList
        data={loading ? [] : data}
        keyExtractor={(item, index) =>
          item?.id != null ? String(item.id) : `${activeTab}-${index}`
        }
        ListHeaderComponent={renderTabs()}
        renderItem={({ item }) => {
          if (activeTab === "finance") {
            return (
              <TransactionCard
                amount={item.amount}
                category={item.category || "Society Dues"}
                date={item.date}
                type={item.type === "income" ? "income" : "expense"}
                note={item.note}
                hasAttachment={item.hasAttachment}
                attachments={item.attachments}
                onPress={() => setSelectedTransaction(item)}
              />
            );
          } else {
            // Normalize status strings from backend
            let status = "Open";
            if (item.status === "in_progress") status = "In Progress";
            else if (item.status === "resolved") status = "Resolved";
            else if (item.status === "closed") status = "Closed";

            // Normalize priority string
            let priority = "Medium";
            if (item.priority === "high") priority = "High";
            else if (item.priority === "low") priority = "Low";

            return (
              <TicketCard
                id={item.id}
                title={item.title}
                status={status as any}
                priority={priority as any}
                createdAt={item.created_at}
                type={item.type as any}
                onPress={() => router.push({
                  pathname: "/society/ticket-details",
                  params: { id: item.id }
                })}
              />
            );
          }
        }}
        ListEmptyComponent={
          loading ? renderLoading() : error ? <ErrorState onRetry={() => fetchData()} /> : renderEmpty()
        }
        contentContainerStyle={activeTab === "finance" ? styles.financeList : styles.ticketList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} colors={[theme.accent]} />
        }
      />

      {activeTab === "tickets" && ticketsEnabled && !loading && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/society/create-ticket")}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={32} color={theme.onAccent} />
        </TouchableOpacity>
      )}

      {/* Transaction Detail Modal */}
      <Modal
        visible={!!selectedTransaction}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTransaction(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={{ flex: 1 }} 
            activeOpacity={1} 
            onPress={() => setSelectedTransaction(null)} 
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transaction Details</Text>
              <TouchableOpacity onPress={() => setSelectedTransaction(null)}>
                <Ionicons name="close" size={24} color={theme.textTertiary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Category</Text>
                <Text style={styles.modalValue}>{selectedTransaction?.category}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Amount</Text>
                <Text style={[
                  styles.modalValue, 
                  { fontFamily: fonts.bold, fontSize: 24 },
                  selectedTransaction?.type === "income" ? styles.incomeAmount : styles.expenseAmount
                ]}>
                  {selectedTransaction?.type === "income" ? "+" : "-"} ₹{Math.abs(selectedTransaction?.amount || 0).toLocaleString()}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Date</Text>
                <Text style={styles.modalValue}>
                  {selectedTransaction && new Date(selectedTransaction.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>

              {selectedTransaction?.note && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Description</Text>
                  <Text style={styles.modalValue}>{selectedTransaction.note}</Text>
                </View>
              )}

              {selectedTransaction?.attachments && selectedTransaction.attachments.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Attachments ({selectedTransaction.attachments.length})</Text>
                  <View style={styles.attachmentList}>
                    {selectedTransaction.attachments.map((att: any, idx: number) => (
                      <TouchableOpacity 
                        key={att.id || idx} 
                        style={styles.attachmentItem}
                        onPress={() => openAttachment(att.file_url)}
                      >
                        <Ionicons 
                          name={att.file_type?.includes("pdf") ? "document-text" : "image"} 
                          size={20} 
                          color={theme.textSecondary}
                        />
                        <Text style={styles.attachmentName} numberOfLines={1}>
                          {att.original_filename || `Attachment ${idx + 1}`}
                        </Text>
                        <Ionicons name="open-outline" size={16} color={theme.textTertiary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setSelectedTransaction(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

