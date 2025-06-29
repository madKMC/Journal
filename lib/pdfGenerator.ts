import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { format } from 'date-fns'
import { Database } from '@/types/database'

type JournalEntry = Database['public']['Tables']['journal_entries']['Row']

const moodEmojis: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  excited: '🎉',
  peaceful: '😌',
  anxious: '😰',
  grateful: '🙏',
  reflective: '🤔',
  energetic: '⚡',
  overwhelmed: '😵',
  insecure: '😔',
  angry: '😠',
  numb: '😶',
  burnt_out: '😴',
  lonely: '😞',
  general: '😐',
}

const moodLabels: Record<string, string> = {
  happy: 'Happy',
  sad: 'Sad',
  excited: 'Excited',
  peaceful: 'Peaceful',
  anxious: 'Anxious',
  grateful: 'Grateful',
  reflective: 'Reflective',
  energetic: 'Energetic',
  overwhelmed: 'Overwhelmed',
  insecure: 'Insecure',
  angry: 'Angry',
  numb: 'Numb',
  burnt_out: 'Burnt Out',
  lonely: 'Lonely',
  general: 'General',
}

// Helper function to strip HTML tags and convert to plain text
const stripHtml = (html: string): string => {
  // Create a temporary div element
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  
  // Handle common HTML elements
  const text = tmp.textContent || tmp.innerText || ''
  
  // Clean up extra whitespace
  return text.replace(/\s+/g, ' ').trim()
}

// Helper function to split text into lines that fit within a given width
const splitTextToLines = (pdf: jsPDF, text: string, maxWidth: number): string[] => {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const textWidth = pdf.getTextWidth(testLine)
    
    if (textWidth > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  
  if (currentLine) {
    lines.push(currentLine)
  }
  
  return lines
}

export const generateEntryPDF = async (entry: JournalEntry): Promise<void> => {
  try {
    // Create new PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)
    
    let yPosition = margin

    // Add header with app branding
    pdf.setFontSize(12)
    pdf.setTextColor(100, 100, 100)
    pdf.text('My Journal', margin, yPosition)
    
    // Add date on the right
    const dateText = format(new Date(entry.created_at), 'MMMM d, yyyy')
    const dateWidth = pdf.getTextWidth(dateText)
    pdf.text(dateText, pageWidth - margin - dateWidth, yPosition)
    
    yPosition += 15

    // Add title
    pdf.setFontSize(24)
    pdf.setTextColor(51, 51, 51) // Dark gray
    const titleLines = splitTextToLines(pdf, entry.title, contentWidth)
    
    for (const line of titleLines) {
      if (yPosition > pageHeight - margin - 20) {
        pdf.addPage()
        yPosition = margin
      }
      pdf.text(line, margin, yPosition)
      yPosition += 10
    }
    
    yPosition += 10

    // Add mood if present
    if (entry.mood) {
      pdf.setFontSize(12)
      pdf.setTextColor(100, 100, 100)
      const moodText = `${moodEmojis[entry.mood] || '😐'} ${moodLabels[entry.mood] || entry.mood}`
      pdf.text(`Mood: ${moodText}`, margin, yPosition)
      yPosition += 10
    }

    // Add privacy status
    pdf.setFontSize(10)
    pdf.setTextColor(120, 120, 120)
    const privacyText = entry.is_private ? '🔒 Private Entry' : '🌍 Public Entry'
    pdf.text(privacyText, margin, yPosition)
    yPosition += 15

    // Add separator line
    pdf.setDrawColor(200, 200, 200)
    pdf.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 15

    // Process content
    const isRichText = /<[^>]*>/.test(entry.content)
    let contentText = entry.content

    if (isRichText) {
      // For rich text, we'll strip HTML and add basic formatting indicators
      contentText = stripHtml(entry.content)
    }

    // Add content
    pdf.setFontSize(11)
    pdf.setTextColor(51, 51, 51)
    const contentLines = splitTextToLines(pdf, contentText, contentWidth)
    
    for (const line of contentLines) {
      if (yPosition > pageHeight - margin - 10) {
        pdf.addPage()
        yPosition = margin
      }
      pdf.text(line, margin, yPosition)
      yPosition += 6
    }

    // Add footer with creation/update info
    const footerY = pageHeight - 15
    pdf.setFontSize(8)
    pdf.setTextColor(150, 150, 150)
    
    const createdText = `Created: ${format(new Date(entry.created_at), 'MMM d, yyyy \'at\' h:mm a')}`
    pdf.text(createdText, margin, footerY)
    
    if (entry.updated_at !== entry.created_at) {
      const updatedText = `Updated: ${format(new Date(entry.updated_at), 'MMM d, yyyy \'at\' h:mm a')}`
      const updatedWidth = pdf.getTextWidth(updatedText)
      pdf.text(updatedText, pageWidth - margin - updatedWidth, footerY)
    }

    // Generate filename
    const safeTitle = entry.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const dateStr = format(new Date(entry.created_at), 'yyyy-MM-dd')
    const filename = `journal_entry_${dateStr}_${safeTitle}.pdf`

    // Save the PDF
    pdf.save(filename)

  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF')
  }
}

export const generateMultipleEntriesPDF = async (entries: JournalEntry[], title: string = 'Journal Entries'): Promise<void> => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)
    
    let yPosition = margin

    // Add title page
    pdf.setFontSize(28)
    pdf.setTextColor(51, 51, 51)
    const titleY = pageHeight / 2 - 20
    pdf.text(title, margin, titleY)
    
    pdf.setFontSize(14)
    pdf.setTextColor(100, 100, 100)
    pdf.text(`${entries.length} ${entries.length === 1 ? 'Entry' : 'Entries'}`, margin, titleY + 15)
    
    const dateRange = entries.length > 1 
      ? `${format(new Date(entries[entries.length - 1].created_at), 'MMM d, yyyy')} - ${format(new Date(entries[0].created_at), 'MMM d, yyyy')}`
      : format(new Date(entries[0].created_at), 'MMM d, yyyy')
    
    pdf.text(dateRange, margin, titleY + 25)

    // Add new page for entries
    pdf.addPage()
    yPosition = margin

    // Process each entry
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      
      // Check if we need a new page
      if (yPosition > pageHeight - margin - 50) {
        pdf.addPage()
        yPosition = margin
      }

      // Entry header
      pdf.setFontSize(18)
      pdf.setTextColor(51, 51, 51)
      const titleLines = splitTextToLines(pdf, entry.title, contentWidth)
      
      for (const line of titleLines) {
        if (yPosition > pageHeight - margin - 20) {
          pdf.addPage()
          yPosition = margin
        }
        pdf.text(line, margin, yPosition)
        yPosition += 8
      }
      
      yPosition += 5

      // Entry metadata
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      const entryDate = format(new Date(entry.created_at), 'MMMM d, yyyy')
      let metadataText = entryDate
      
      if (entry.mood) {
        const moodText = `${moodEmojis[entry.mood] || '😐'} ${moodLabels[entry.mood] || entry.mood}`
        metadataText += ` • ${moodText}`
      }
      
      pdf.text(metadataText, margin, yPosition)
      yPosition += 10

      // Entry content
      const isRichText = /<[^>]*>/.test(entry.content)
      let contentText = isRichText ? stripHtml(entry.content) : entry.content
      
      pdf.setFontSize(10)
      pdf.setTextColor(51, 51, 51)
      const contentLines = splitTextToLines(pdf, contentText, contentWidth)
      
      for (const line of contentLines) {
        if (yPosition > pageHeight - margin - 10) {
          pdf.addPage()
          yPosition = margin
        }
        pdf.text(line, margin, yPosition)
        yPosition += 5
      }
      
      // Add spacing between entries
      if (i < entries.length - 1) {
        yPosition += 15
        
        // Add separator line
        if (yPosition < pageHeight - margin - 20) {
          pdf.setDrawColor(220, 220, 220)
          pdf.line(margin, yPosition, pageWidth - margin, yPosition)
          yPosition += 15
        }
      }
    }

    // Generate filename
    const dateStr = format(new Date(), 'yyyy-MM-dd')
    const filename = `journal_entries_${dateStr}.pdf`

    // Save the PDF
    pdf.save(filename)

  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF')
  }
}