'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Users, Phone, Mail, Calendar, FileText, Eye } from 'lucide-react'

export default function PatientRecords() {
  const [doctor, setDoctor] = useState(null)
  const [patients, setPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const router = useRouter()

  // Mock patient data
  const mockPatients = [
    {
      id: 1,
      name: "John Doe",
      age: 45,
      gender: "Male",
      phone: "+1 (555) 123-4567",
      email: "john.doe@email.com",
      lastVisit: "2024-01-10",
      nextAppointment: "2024-01-15",
      condition: "Hypertension",
      status: "Active",
      bloodType: "O+",
      allergies: ["Penicillin"],
      medications: ["Lisinopril 10mg", "Metformin 500mg"],
      visits: [
        { date: "2024-01-10", reason: "Regular checkup", notes: "Blood pressure stable" },
        { date: "2023-12-15", reason: "Follow-up", notes: "Medication adjustment needed" },
        { date: "2023-11-20", reason: "Initial consultation", notes: "Diagnosed with hypertension" }
      ]
    },
    {
      id: 2,
      name: "Jane Smith",
      age: 32,
      gender: "Female",
      phone: "+1 (555) 234-5678",
      email: "jane.smith@email.com",
      lastVisit: "2024-01-08",
      nextAppointment: "2024-01-16",
      condition: "Migraine",
      status: "Active",
      bloodType: "A+",
      allergies: ["Aspirin"],
      medications: ["Sumatriptan 50mg"],
      visits: [
        { date: "2024-01-08", reason: "Migraine consultation", notes: "Frequency reduced with current medication" },
        { date: "2023-12-20", reason: "Follow-up", notes: "Trying new preventive medication" }
      ]
    },
    {
      id: 3,
      name: "Mike Johnson",
      age: 28,
      gender: "Male",
      phone: "+1 (555) 345-6789",
      email: "mike.johnson@email.com",
      lastVisit: "2024-01-05",
      nextAppointment: "2024-01-17",
      condition: "Anxiety",
      status: "Active",
      bloodType: "B+",
      allergies: ["None"],
      medications: ["Sertraline 25mg"],
      visits: [
        { date: "2024-01-05", reason: "Mental health consultation", notes: "Responding well to treatment" },
        { date: "2023-12-10", reason: "Initial consultation", notes: "Started on low-dose SSRI" }
      ]
    },
    {
      id: 4,
      name: "Sarah Wilson",
      age: 55,
      gender: "Female",
      phone: "+1 (555) 456-7890",
      email: "sarah.wilson@email.com",
      lastVisit: "2023-12-28",
      nextAppointment: "2024-01-18",
      condition: "Diabetes Type 2",
      status: "Active",
      bloodType: "AB+",
      allergies: ["Sulfa drugs"],
      medications: ["Metformin 1000mg", "Glipizide 5mg"],
      visits: [
        { date: "2023-12-28", reason: "Diabetes management", notes: "HbA1c improved to 7.2%" },
        { date: "2023-11-30", reason: "Quarterly checkup", notes: "Blood sugar levels stable" }
      ]
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
    setPatients(mockPatients)
  }, [router])

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!doctor) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/doctor/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-emerald-600">Patient Records</h1>
                <p className="text-sm text-gray-600">Manage patient information and medical history</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Patients ({filteredPatients.length})
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        selectedPatient?.id === patient.id ? 'border-emerald-300 bg-emerald-50' : ''
                      }`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                        <Badge className="bg-green-100 text-green-800">
                          {patient.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{patient.condition}</p>
                      <p className="text-xs text-gray-500">
                        Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Details */}
          <div className="lg:col-span-2">
            {selectedPatient ? (
              <div className="space-y-6">
                {/* Patient Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedPatient.name}</span>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Record
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Age:</span>
                            <span>{selectedPatient.age} years</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Gender:</span>
                            <span>{selectedPatient.gender}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Blood Type:</span>
                            <span>{selectedPatient.bloodType}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">{selectedPatient.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">{selectedPatient.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">Next: {new Date(selectedPatient.nextAppointment).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Medical Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Medications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedPatient.medications.map((medication, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-2 h-2 bg-emerald-600 rounded-full mr-3"></div>
                            <span className="text-sm">{medication}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Allergies</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedPatient.allergies.map((allergy, index) => (
                          <Badge key={index} variant="outline" className="mr-2">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Visit History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Recent Visits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedPatient.visits.map((visit, index) => (
                        <div key={index} className="border-l-4 border-emerald-200 pl-4">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900">{visit.reason}</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(visit.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{visit.notes}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Patient</h3>
                    <p className="text-gray-600">Choose a patient from the list to view their medical records</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
