import React, { useState, useEffect, useCallback } from "react";
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
import { colors } from "../../constants/tokens";
import { societyStyles as styles } from "../../styles/society.styles";
import { TransactionCard } from "../../components/society/TransactionCard";
import { TicketCard } from "../../components/society/TicketCard";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";

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
  const [activeTab, setActiveTab] = useState<ActiveTab>("finance");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
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
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }

  }, [activeTab]);

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
        toolbarColor: "#111827",
        enableBarCollapsing: true,
        showTitle: true,
      });
    } catch (err) {
      console.error("Could not open attachment", err);
    }
  };

  const renderTabs = () => {
    // Finance summary totals
    const totalIncome  = activeTab === "finance" ? data.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + t.amount, 0) : 0;
    const totalExpense = activeTab === "finance" ? data.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + t.amount, 0) : 0;

    return (
      <>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "finance" && styles.activeTab]}
            onPress={() => setActiveTab("finance")}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === "finance" && styles.activeTabText]}>Finance</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "tickets" && styles.activeTab]}
            onPress={() => setActiveTab("tickets")}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === "tickets" && styles.activeTabText]}>Tickets</Text>
          </TouchableOpacity>
        </View>

        {/* Finance summary cards */}
        {activeTab === "finance" && !loading && data.length > 0 && (
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0", borderWidth: 1 }]}>
              <View style={[styles.summaryIconWrap, { backgroundColor: "#DCFCE7" }]}>
                <Ionicons name="arrow-down-circle" size={18} color="#16A34A" />
              </View>
              <Text style={[styles.summaryLabel, { color: "#15803D" }]}>Total Income</Text>
              <Text style={[styles.summaryValue, styles.summaryValueIncome]}>
                ₹{totalIncome.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: "#FFF1F2", borderColor: "#FECDD3", borderWidth: 1 }]}>
              <View style={[styles.summaryIconWrap, { backgroundColor: "#FFE4E6" }]}>
                <Ionicons name="arrow-up-circle" size={18} color="#E11D48" />
              </View>
              <Text style={[styles.summaryLabel, { color: "#BE123C" }]}>Total Expenses</Text>
              <Text style={[styles.summaryValue, styles.summaryValueExpense]}>
                ₹{totalExpense.toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {/* Count strip */}
        {!loading && data.length > 0 && (
          <View style={styles.countStrip}>
            <Text style={styles.countStripText}>
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

  const renderEmpty = () => (
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
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      {/* Fixed top header — matches dashboard */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 4, height: 22, backgroundColor: colors.accent, borderRadius: 2, marginRight: 8 }} />
            <Text style={styles.title}>Society</Text>
          </View>
          <Text style={[styles.subtitle, { marginLeft: 12 }]}>
            {activeTab === "finance" ? "Transactions & billing" : "Support tickets"}
          </Text>
        </View>
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
        ListEmptyComponent={loading ? renderLoading() : renderEmpty()}
        contentContainerStyle={activeTab === "finance" ? styles.financeList : styles.ticketList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />
        }
      />

      {activeTab === "tickets" && !loading && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/society/create-ticket")}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={32} color="#fff" />
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
                <Ionicons name="close" size={24} color="#9CA3AF" />
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
                  { fontWeight: "bold", fontSize: 24 },
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
                          color="#D1D5DB" 
                        />
                        <Text style={styles.attachmentName} numberOfLines={1}>
                          {att.original_filename || `Attachment ${idx + 1}`}
                        </Text>
                        <Ionicons name="open-outline" size={16} color="#94A3B8" />
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

