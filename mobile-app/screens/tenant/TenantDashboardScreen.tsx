"use client"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Card, Title, Paragraph, Badge, Button, Avatar } from "react-native-paper"
import { Ionicons } from "@expo/vector-icons"
import useAuth from "../../hooks/useAuth"

const TenantDashboardScreen = ({ navigation }: any) => {
  const { user } = useAuth()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.unitText}>Unit {user?.unitNumber}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Avatar.Text
            size={40}
            label={
              user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "U"
            }
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.cardsContainer}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Title style={styles.cardTitle}>Active Tickets</Title>
                <Badge style={styles.badge}>2</Badge>
              </View>
              <Paragraph style={styles.cardText}>2 Open</Paragraph>
              <Text style={styles.cardSubtext}>1 in progress, 1 pending</Text>
            </Card.Content>
            <Card.Actions>
              <Button mode="outlined" onPress={() => navigation.navigate("Tickets")} style={styles.cardButton}>
                View Tickets
              </Button>
            </Card.Actions>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Title style={styles.cardTitle}>Rent Status</Title>
                <Badge style={[styles.badge, styles.paidBadge]}>Paid</Badge>
              </View>
              <Paragraph style={styles.cardText}>$1,250.00</Paragraph>
              <Text style={styles.cardSubtext}>Next payment: May 1, 2024</Text>
            </Card.Content>
            <Card.Actions>
              <Button mode="outlined" onPress={() => navigation.navigate("Payments")} style={styles.cardButton}>
                Payment History
              </Button>
            </Card.Actions>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Title style={styles.cardTitle}>Visitor Access</Title>
                <Ionicons name="qr-code" size={20} color="#64748b" />
              </View>
              <Paragraph style={styles.cardText}>Generate Code</Paragraph>
              <Text style={styles.cardSubtext}>Create temporary access for visitors</Text>
            </Card.Content>
            <Card.Actions>
              <Button mode="outlined" onPress={() => navigation.navigate("Visitor")} style={styles.cardButton}>
                Create Access Code
              </Button>
            </Card.Actions>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Title style={styles.cardTitle}>Announcements</Title>
                <Badge style={styles.badge}>3 New</Badge>
              </View>
              <Paragraph style={styles.cardText}>Community Updates</Paragraph>
              <Text style={styles.cardSubtext}>3 new announcements</Text>
            </Card.Content>
            <Card.Actions>
              <Button mode="outlined" onPress={() => navigation.navigate("Announcements")} style={styles.cardButton}>
                View All
              </Button>
            </Card.Actions>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Maintenance Tickets</Text>

          <Card style={styles.ticketCard}>
            <Card.Content>
              <View style={styles.ticketRow}>
                <View style={[styles.statusDot, styles.inProgressDot]} />
                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketTitle}>Leaking faucet in kitchen</Text>
                  <Text style={styles.ticketDate}>Submitted on Apr 15, 2024</Text>
                </View>
                <Badge style={styles.inProgressBadge}>In Progress</Badge>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.ticketCard}>
            <Card.Content>
              <View style={styles.ticketRow}>
                <View style={[styles.statusDot, styles.pendingDot]} />
                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketTitle}>AC not cooling properly</Text>
                  <Text style={styles.ticketDate}>Submitted on Apr 10, 2024</Text>
                </View>
                <Badge style={styles.pendingBadge}>Pending</Badge>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.ticketCard}>
            <Card.Content>
              <View style={styles.ticketRow}>
                <View style={[styles.statusDot, styles.completedDot]} />
                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketTitle}>Light bulb replacement in bathroom</Text>
                  <Text style={styles.ticketDate}>Completed on Apr 5, 2024</Text>
                </View>
                <Badge style={styles.completedBadge}>Completed</Badge>
              </View>
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={() => navigation.navigate("Tickets", { screen: "CreateTicket" })}
            style={styles.createButton}
          >
            Create New Ticket
          </Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Building Announcements</Text>

          <Card style={styles.announcementCard}>
            <Card.Content>
              <Text style={styles.announcementTitle}>Scheduled Maintenance: Water Shut-off</Text>
              <Text style={styles.announcementBody}>
                Water will be shut off on April 30th from 10am-2pm for routine maintenance.
              </Text>
              <Text style={styles.announcementDate}>Posted on Apr 20, 2024</Text>
            </Card.Content>
          </Card>

          <Card style={styles.announcementCard}>
            <Card.Content>
              <Text style={styles.announcementTitle}>Community BBQ Event</Text>
              <Text style={styles.announcementBody}>
                Join us for a community BBQ in the courtyard on May 15th from 4-7pm.
              </Text>
              <Text style={styles.announcementDate}>Posted on Apr 18, 2024</Text>
            </Card.Content>
          </Card>

          <Card style={styles.announcementCard}>
            <Card.Content>
              <Text style={styles.announcementTitle}>Parking Garage Cleaning</Text>
              <Text style={styles.announcementBody}>
                The parking garage will be cleaned on May 5th. Please remove vehicles by 8am.
              </Text>
              <Text style={styles.announcementDate}>Posted on Apr 15, 2024</Text>
            </Card.Content>
          </Card>

          <Button mode="outlined" onPress={() => navigation.navigate("Announcements")} style={styles.viewAllButton}>
            View All Announcements
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  greeting: {
    fontSize: 14,
    color: "#64748b",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  unitText: {
    fontSize: 14,
    color: "#64748b",
  },
  content: {
    flex: 1,
  },
  cardsContainer: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  cardText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 12,
    color: "#64748b",
  },
  badge: {
    backgroundColor: "#3b82f6",
  },
  paidBadge: {
    backgroundColor: "#10b981",
  },
  cardButton: {
    width: "100%",
  },
  section: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  ticketCard: {
    marginBottom: 8,
  },
  ticketRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  inProgressDot: {
    backgroundColor: "#f59e0b",
  },
  pendingDot: {
    backgroundColor: "#3b82f6",
  },
  completedDot: {
    backgroundColor: "#10b981",
  },
  ticketInfo: {
    flex: 1,
  },
  ticketTitle: {
    fontWeight: "500",
  },
  ticketDate: {
    fontSize: 12,
    color: "#64748b",
  },
  inProgressBadge: {
    backgroundColor: "#f59e0b",
  },
  pendingBadge: {
    backgroundColor: "#3b82f6",
  },
  completedBadge: {
    backgroundColor: "#10b981",
  },
  createButton: {
    marginTop: 16,
    backgroundColor: "#3b82f6",
  },
  announcementCard: {
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  announcementTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  announcementBody: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
  },
  announcementDate: {
    fontSize: 12,
    color: "#64748b",
  },
  viewAllButton: {
    marginTop: 16,
  },
})

export default TenantDashboardScreen
