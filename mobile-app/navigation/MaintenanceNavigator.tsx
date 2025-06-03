import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import MaintenanceDashboardScreen from "../screens/maintenance/MaintenanceDashboardScreen"
import MaintenanceTicketsScreen from "../screens/maintenance/MaintenanceTicketsScreen"
import TicketDetailScreen from "../screens/maintenance/TicketDetailScreen"
import ScheduleScreen from "../screens/maintenance/ScheduleScreen"
import MaterialsScreen from "../screens/maintenance/MaterialsScreen"
import CompletedJobsScreen from "../screens/maintenance/CompletedJobsScreen"

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

// Stack navigators for each tab
const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MaintenanceDashboard" component={MaintenanceDashboardScreen} />
  </Stack.Navigator>
)

const TicketsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="MaintenanceTicketsList" component={MaintenanceTicketsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="TicketDetail" component={TicketDetailScreen} options={{ title: "Ticket Details" }} />
  </Stack.Navigator>
)

const ScheduleStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ScheduleMain" component={ScheduleScreen} />
  </Stack.Navigator>
)

const MaterialsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MaterialsMain" component={MaterialsScreen} />
  </Stack.Navigator>
)

const CompletedStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CompletedMain" component={CompletedJobsScreen} />
  </Stack.Navigator>
)

const MaintenanceNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Tickets") {
            iconName = focused ? "document-text" : "document-text-outline"
          } else if (route.name === "Schedule") {
            iconName = focused ? "calendar" : "calendar-outline"
          } else if (route.name === "Materials") {
            iconName = focused ? "construct" : "construct-outline"
          } else if (route.name === "Completed") {
            iconName = focused ? "checkmark-circle" : "checkmark-circle-outline"
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
      <Tab.Screen name="Schedule" component={ScheduleStack} />
      <Tab.Screen name="Materials" component={MaterialsStack} />
      <Tab.Screen name="Completed" component={CompletedStack} />
    </Tab.Navigator>
  )
}

export default MaintenanceNavigator
