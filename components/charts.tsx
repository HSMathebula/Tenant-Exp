"use client"

import { useEffect, useRef } from "react"

export function LineChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Sample data
    const data = [
      12, 19, 15, 8, 22, 18, 25, 20, 15, 18, 22, 30, 25, 28, 24, 20, 18, 15, 20, 22, 25, 28, 30, 25, 22, 18, 15, 20, 24,
      28,
    ]
    const labels = Array.from({ length: data.length }, (_, i) => `${i + 1}`)

    // Chart dimensions
    const width = canvas.width
    const height = canvas.height
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.strokeStyle = "#e2e8f0"
    ctx.stroke()

    // Calculate scales
    const maxValue = Math.max(...data) * 1.1
    const xScale = chartWidth / (data.length - 1)
    const yScale = chartHeight / maxValue

    // Draw grid lines
    ctx.beginPath()
    for (let i = 0; i <= 5; i++) {
      const y = height - padding - (i * chartHeight) / 5
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)

      // Add y-axis labels
      ctx.fillStyle = "#94a3b8"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(Math.round((i * maxValue) / 5).toString(), padding - 5, y + 3)
    }
    ctx.strokeStyle = "#e2e8f0"
    ctx.stroke()

    // Draw x-axis labels (only show some to avoid crowding)
    ctx.fillStyle = "#94a3b8"
    ctx.font = "10px sans-serif"
    ctx.textAlign = "center"
    for (let i = 0; i < data.length; i += 5) {
      const x = padding + i * xScale
      ctx.fillText(labels[i], x, height - padding + 15)
    }

    // Draw line
    ctx.beginPath()
    ctx.moveTo(padding, height - padding - data[0] * yScale)
    for (let i = 1; i < data.length; i++) {
      ctx.lineTo(padding + i * xScale, height - padding - data[i] * yScale)
    }
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw area under the line
    ctx.lineTo(padding + (data.length - 1) * xScale, height - padding)
    ctx.lineTo(padding, height - padding)
    ctx.fillStyle = "rgba(59, 130, 246, 0.1)"
    ctx.fill()

    // Draw data points
    for (let i = 0; i < data.length; i++) {
      ctx.beginPath()
      ctx.arc(padding + i * xScale, height - padding - data[i] * yScale, 3, 0, Math.PI * 2)
      ctx.fillStyle = "#3b82f6"
      ctx.fill()
    }
  }, [])

  return <canvas ref={canvasRef} width={600} height={300} className="w-full h-auto" />
}

export function BarChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Sample data
    const data = [28, 22, 18, 15, 12]
    const labels = ["Mike", "Jessica", "Robert", "Sarah", "David"]

    // Chart dimensions
    const width = canvas.width
    const height = canvas.height
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.strokeStyle = "#e2e8f0"
    ctx.stroke()

    // Calculate scales
    const maxValue = Math.max(...data) * 1.1
    const barWidth = (chartWidth / data.length) * 0.8
    const barSpacing = (chartWidth / data.length) * 0.2
    const yScale = chartHeight / maxValue

    // Draw grid lines
    ctx.beginPath()
    for (let i = 0; i <= 5; i++) {
      const y = height - padding - (i * chartHeight) / 5
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)

      // Add y-axis labels
      ctx.fillStyle = "#94a3b8"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(Math.round((i * maxValue) / 5).toString(), padding - 5, y + 3)
    }
    ctx.strokeStyle = "#e2e8f0"
    ctx.stroke()

    // Draw bars
    for (let i = 0; i < data.length; i++) {
      const x = padding + i * (barWidth + barSpacing) + barSpacing / 2
      const barHeight = data[i] * yScale

      // Draw bar
      ctx.fillStyle = "#3b82f6"
      ctx.fillRect(x, height - padding - barHeight, barWidth, barHeight)

      // Add x-axis labels
      ctx.fillStyle = "#94a3b8"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(labels[i], x + barWidth / 2, height - padding + 15)
    }
  }, [])

  return <canvas ref={canvasRef} width={600} height={300} className="w-full h-auto" />
}

export function PieChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Sample data
    const data = [35, 25, 20, 10, 10]
    const labels = ["Plumbing", "Electrical", "HVAC", "Appliance", "Other"]
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

    // Chart dimensions
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 40

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Calculate total
    const total = data.reduce((sum, value) => sum + value, 0)

    // Draw pie chart
    let startAngle = -Math.PI / 2
    for (let i = 0; i < data.length; i++) {
      const sliceAngle = (2 * Math.PI * data[i]) / total

      // Draw slice
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = colors[i]
      ctx.fill()

      // Draw label line and text
      const midAngle = startAngle + sliceAngle / 2
      const labelRadius = radius * 1.2
      const labelX = centerX + Math.cos(midAngle) * labelRadius
      const labelY = centerY + Math.sin(midAngle) * labelRadius

      // Draw line
      ctx.beginPath()
      ctx.moveTo(centerX + Math.cos(midAngle) * radius, centerY + Math.sin(midAngle) * radius)
      ctx.lineTo(labelX, labelY)
      ctx.strokeStyle = colors[i]
      ctx.stroke()

      // Draw label
      ctx.fillStyle = "#64748b"
      ctx.font = "12px sans-serif"
      ctx.textAlign = midAngle < Math.PI ? "left" : "right"
      ctx.textBaseline = "middle"
      ctx.fillText(`${labels[i]} (${data[i]}%)`, midAngle < Math.PI ? labelX + 5 : labelX - 5, labelY)

      startAngle += sliceAngle
    }
  }, [])

  return <canvas ref={canvasRef} width={400} height={400} className="w-full h-auto" />
}
