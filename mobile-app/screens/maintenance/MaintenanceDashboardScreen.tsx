"use client"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Card, Title, Paragraph, Badge, Button, Avatar, Chip } from "react-native-paper"
import { Ionicons } from "@expo/vector-icons"
import useAuth from "../../hooks/useAuth"

const MaintenanceDashboardScreen = ({ navigation }: any) => {
  const { user } = useAuth()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.roleText}>Maintenance Staff</Text>
        </View>
        <TouchableOpacity>
          <Avatar.Text
            size={40}
            label={
              user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "M"
            }
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.cardsContainer}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Title style={styles.cardTitle}>Assigned Tickets</Title>
                <Badge style={styles.badge}>4</Badge>
              </View>
              <Paragraph style={styles.cardText}>4 Active</Paragraph>
              <Text style={styles.cardSubtext}>2 urgent, 2 normal</Text>
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
                <Title style={styles.cardTitle}>Today's Schedule</Title>
                <Ionicons name="calendar" size={20} color="#64748b" />
              </View>
              <Paragraph style={styles.cardText}>3 Jobs</Paragraph>
              <Text style={styles.cardSubtext}>8:00 AM - 5:00 PM</Text>
            </Card.Content>
            <Card.Actions>
              <Button mode="outlined" onPress={() => navigation.navigate("Schedule")} style={styles.cardButton}>
                View Schedule
              </Button>
            </Card.Actions>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Title style={styles.cardTitle}>Completed This Week</Title>
                <Ionicons name="checkmark-circle" size={20} color="#64748b" />
              </View>
              <Paragraph style={styles.cardText}>12 Tickets</Paragraph>
              <Text style={styles.cardSubtext}>Avg. completion: 1.2 days</Text>
            </Card.Content>
            <Card.Actions>
              <Button mode="outlined" onPress={() => navigation.navigate("Completed")} style={styles.cardButton}>
                View History
              </Button>
            </Card.Actions>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Title style={styles.cardTitle}>Pending Materials</Title>
                <Ionicons name="construct" size={20} color="#64748b" />
              </View>
              <Paragraph style={styles.cardText}>2 Jobs</Paragraph>
              <Text style={styles.cardSubtext}>Waiting for parts</Text>
            </Card.Content>
            <Card.Actions>
              <Button mode="outlined" onPress={() => navigation.navigate("Materials")} style={styles.cardButton}>
                View Details
              </Button>
            </Card.Actions>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Assigned Tickets</Text>

          <Card style={styles.ticketCard}>
            <Card.Content>
              <View style={styles.ticketHeader}>
                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketTitle}>Water leak under kitchen sink</Text>
                  <Badge style={styles.urgentBadge}>Urgent</Badge>
                </View>
              </View>
              <Text style={styles.ticketLocation}>Unit 302 - Sarah Johnson</Text>
              <Text style={styles.ticketDescription}>
                Water is pooling under the sink and appears to be coming from the pipe connection.
              </Text>
              <View style={styles.ticketMeta}>
                <Chip icon="clock" style={styles.chip}>
                  Reported: 2 hours ago
                </Chip>
                <Chip icon="calendar" style={styles.chip}>
                  Today, 11:00 AM
                </Chip>
              </View>
              <Button
                mode="contained"
                onPress={() =>
                  navigation.navigate("Tickets", {
                    screen: "TicketDetail",
                    params: { id: "1" },
                  })
                }
                style={styles.startButton}
              >
                Start Job
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.ticketCard}>
            <Card.Content>
              <View style={styles.ticketHeader}>
                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketTitle}>AC not cooling properly</Text>
                  <Badge style={styles.normalBadge}>Normal</Badge>
                </View>
              </View>
              <Text style={styles.ticketLocation}>Unit 415 - Michael Chen</Text>
              <Text style={styles.ticketDescription}>
                Air conditioner is running but not cooling the apartment effectively.
              </Text>
              <View style={styles.ticketMeta}>
                <Chip icon="clock" style={styles.chip}>
                  Reported: 1 day ago
                </Chip>
                <Chip icon="calendar" style={styles.chip}>
                  Today, 2:00 PM
                </Chip>
              </View>
              <Button
                mode="contained"
                onPress={() =>
                  navigation.navigate("Tickets", {
                    screen: "TicketDetail",
                    params: { id: "2" },
                  })
                }
                style={styles.startButton}
              >
                Start Job
              </Button>
            </Card.Content>
          </Card>

          <Button mode="outlined" onPress={() => navigation.navigate("Tickets")} style={styles.viewAllButton}>
            View All Assigned Tickets
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
  roleText: {
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
    marginBottom: 16,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  ticketInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  urgentBadge: {
    backgroundColor: "#ef4444",
  },
  normalBadge: {
    backgroundColor: "#f59e0b",
  },
  ticketLocation: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  ticketDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  ticketMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  startButton: {
    backgroundColor: "#3b82f6",
  },
  viewAllButton: {
    marginTop: 8,
  },
})

export default MaintenanceDashboardScreen
