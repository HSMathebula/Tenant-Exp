import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import TenantDashboardScreen from "../screens/tenant/TenantDashboardScreen"
import TicketsScreen from "../screens/tenant/TicketsScreen"
import CreateTicketScreen from "../screens/tenant/CreateTicketScreen"
import VisitorAccessScreen from "../screens/tenant/VisitorAccessScreen"
import ProfileScreen from "../screens/tenant/ProfileScreen"
import PaymentsScreen from "../screens/tenant/PaymentsScreen"

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

// Stack navigators for each tab
const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TenantDashboard" component={TenantDashboardScreen} />
  </Stack.Navigator>
)

const TicketsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="TicketsList" component={TicketsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="CreateTicket" component={CreateTicketScreen} options={{ title: "New Ticket" }} />
  </Stack.Navigator>
)

const VisitorStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="VisitorAccess" component={VisitorAccessScreen} />
  </Stack.Navigator>
)

const PaymentsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PaymentsList" component={PaymentsScreen} />
  </Stack.Navigator>
)

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
  </Stack.Navigator>
)

const TenantNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Tickets") {
            iconName = focused ? "document-text" : "document-text-outline"
          } else if (route.name === "Visitor") {
            iconName = focused ? "qr-code" : "qr-code-outline"
          } else if (route.name === "Payments") {
            iconName = focused ? "card" : "card-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          }

          return <Ionicons name={iconName as any} size={size} color={color} />
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Tickets" component={TicketsStack} />
      <Tab.Screen name="Visitor" component={VisitorStack} />
      <Tab.Screen name="Payments" component={PaymentsStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  )
}

export default TenantNavigator
