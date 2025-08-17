'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, LogOut, Bell, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [stats, setStats] = useState({})
  const router = useRouter()

  // Mock appointments data
  const mockAppointments = [
    {
      id: 1,
      patientName: "John Doe",
      time: "09:00",
      date: "2024-01-15",
      reason: "Regular checkup",
      status: "confirmed",
      phone: "+1 (555) 123-4567"
    },
    {
      id: 2,
      patientName: "Jane Smith",
      time: "10:00",
      date: "2024-01-15",
      reason: "Follow-up consultation",
      status: "pending",
      phone: "+1 (555) 234-5678"
    },
    {
      id: 3,
      patientName: "Mike Johnson",
      time: "11:00",
      date: "2024-01-15",
      reason: "Chest pain evaluation",
      status: "confirmed",
      phone: "+1 (555) 345-6789"
    },
    {
      id: 4,
      patientName: "Sarah Wilson",
      time: "14:00",
      date: "2024-01-15",
      reason: "Routine examination",
      status: "completed",
      phone: "+1 (555) 456-7890"
    },
    {
      id: 5,
      patientName: "David Brown",
      time: "15:00",
      date: "2024-01-15",
      reason: "Blood pressure check",
      status: "cancelled",
      phone: "+1 (555) 567-8901"
    }
  ]

  useEffect(() => {
    // Check authentication
    const doctorAuth = localStorage.getItem('doctorAuth')
    if (!doctorAuth) {
      router.push('/doctor/login')
      return
    }

    const doctorData = JSON.parse(doctorAuth)
    if (!doctorData.isAuthenticated) {
      router.push('/doctor/login')
      return
    }

    setDoctor(doctorData)
    setAppointments(mockAppointments)
    
    // Calculate stats
    const today = new Date().toISOString().split('T')[0]
    const todayAppointments = mockAppointments.filter(apt => apt.date === '2024-01-15') // Mock today
    
    setStats({
      totalToday: todayAppointments.length,
      confirmed: todayAppointments.filter(apt => apt.status === 'confirmed').length,
      pending: todayAppointments.filter(apt => apt.status === 'pending').length,
      completed: todayAppointments.filter(apt => apt.status === 'completed').length
    })
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('doctorAuth')
    router.push('/doctor/login')
  }

  const updateAppointmentStatus = (appointmentId, newStatus) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId ? { ...apt, status: newStatus } : apt
      )
    )
    
    // Update stats
    const updatedAppointments = appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    )
    const todayAppointments = updatedAppointments.filter(apt => apt.date === '2024-01-15')
    
    setStats({
      totalToday: todayAppointments.length,
      confirmed: todayAppointments.filter(apt => apt.status === 'confirmed').length,
      pending: todayAppointments.filter(apt => apt.status === 'pending').length,
      completed: todayAppointments.filter(apt => apt.status === 'completed').length
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <AlertCircle className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return null
    }
  }

  if (!doctor) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-emerald-600">Meera Clinic</h1>
              <p className="text-sm text-gray-600">Doctor Dashboard</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{doctor.name}</p>
                  <p className="text-xs text-gray-500">Cardiologist</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {doctor.name}!</h2>
          <p className="text-gray-600">Here's what's happening with your appointments today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Today's Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{appointment.time}</p>
                      <p className="text-sm text-gray-500">{appointment.date}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                      <p className="text-sm text-gray-600">{appointment.reason}</p>
                      <p className="text-xs text-gray-500">{appointment.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusIcon(appointment.status)}
                      <span className="ml-1 capitalize">{appointment.status}</span>
                    </Badge>
                    
                    {appointment.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                        >
                          Confirm
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                    
                    {appointment.status === 'confirmed' && (
                      <Button 
                        size="sm"
                        onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/doctor/calendar">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">View Calendar</h3>
                <p className="text-sm text-gray-600">Manage your schedule and availability</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/doctor/patients">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Patient Records</h3>
                <p className="text-sm text-gray-600">Access patient history and records</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
