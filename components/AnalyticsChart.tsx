"use client"

import { useMemo } from "react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Calendar } from "lucide-react"

interface Testride {
  date: string
  status: string
}

interface AnalyticsChartProps {
  testrides: Testride[]
}

export function AnalyticsChart({ testrides }: AnalyticsChartProps) {
  // Prepare data for last 30 days
  const chartData = useMemo(() => {
    const days = 30
    const data: Array<{ date: string; count: number; completed: number }> = []
    const today = new Date()
    
    // Initialize all days with 0
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      data.push({
        date: date.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' }),
        count: 0,
        completed: 0
      })
    }
    
    // Count testrides per day
    testrides.forEach((testride) => {
      const testrideDate = new Date(testride.date).toISOString().split('T')[0]
      const today = new Date()
      const daysAgo = Math.floor((today.getTime() - new Date(testrideDate).getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysAgo >= 0 && daysAgo < days) {
        const index = days - 1 - daysAgo
        if (index >= 0 && index < data.length) {
          data[index].count++
          if (testride.status === 'COMPLETED') {
            data[index].completed++
          }
        }
      }
    })
    
    return data
  }, [testrides])

  // Prepare monthly data
  const monthlyData = useMemo(() => {
    const months: Record<string, { total: number; completed: number }> = {}
    
    testrides.forEach((testride) => {
      const date = new Date(testride.date)
      const monthKey = date.toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' })
      
      if (!months[monthKey]) {
        months[monthKey] = { total: 0, completed: 0 }
      }
      
      months[monthKey].total++
      if (testride.status === 'COMPLETED') {
        months[monthKey].completed++
      }
    })
    
    return Object.entries(months)
      .map(([month, data]) => ({
        month,
        ...data
      }))
      .slice(-6) // Last 6 months
  }, [testrides])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Daily Chart - Last 30 days */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-autoofy-dark to-autoofy-dark/90">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Proefritten (Laatste 30 dagen)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#1D3557" 
                strokeWidth={2}
                name="Totaal"
                dot={{ fill: '#1D3557', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Afgerond"
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Chart */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-autoofy-red to-autoofy-red/90">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Proefritten per Maand
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: '#6b7280' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="total" 
                fill="#1D3557" 
                name="Totaal"
                radius={[8, 8, 0, 0]}
              />
              <Bar 
                dataKey="completed" 
                fill="#10b981" 
                name="Afgerond"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

