import jsPDF from 'jspdf'
import { format } from 'date-fns'
import { Database } from '@/types/database'

type JournalEntry = Database['public']['Tables']['journal_entries']['Row']

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

// Helper function to convert HTML to formatted text with basic styling
const convertHtmlToFormattedText = (html: string): Array<{text: string, style: 'normal' | 'bold' | 'italic'}> => {
  // Create a temporary div to parse HTML
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  
  const result: Array<{text: string, style: 'normal' | 'bold' | 'italic'}> = []
  
  const processNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || ''
      if (text.trim()) {
        result.push({ text: text, style: 'normal' })
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      const tagName = element.tagName.toLowerCase()
      
      switch (tagName) {
        case 'strong':
        case 'b':
          // Bold text
          const boldText = element.textContent || ''
          if (boldText.trim()) {
            result.push({ text: boldText, style: 'bold' })
          }
          break
        case 'em':
        case 'i':
          // Italic text
          const italicText = element.textContent || ''
          if (italicText.trim()) {
            result.push({ text: italicText, style: 'italic' })
          }
          break
        case 'p':
        case 'div':
          // Process children and add line break
          for (const child of Array.from(element.childNodes)) {
            processNode(child)
          }
          result.push({ text: '\n', style: 'normal' })
          break
        case 'br':
          result.push({ text: '\n', style: 'normal' })
          break
        case 'ul':
        case 'ol':
          // Process list items
          for (const child of Array.from(element.childNodes)) {
            if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName.toLowerCase() === 'li') {
              result.push({ text: '• ', style: 'normal' })
              processNode(child)
              result.push({ text: '\n', style: 'normal' })
            }
          }
          break
        case 'li':
          // List item content
          for (const child of Array.from(element.childNodes)) {
            processNode(child)
          }
          break
        case 'blockquote':
          result.push({ text: '"', style: 'italic' })
          for (const child of Array.from(element.childNodes)) {
            processNode(child)
          }
          result.push({ text: '"', style: 'italic' })
          result.push({ text: '\n', style: 'normal' })
          break
        default:
          // Process children for other elements
          for (const child of Array.from(element.childNodes)) {
            processNode(child)
          }
          break
      }
    }
  }
  
  processNode(tmp)
  return result
}

// Helper function to split formatted text into lines that fit within a given width
const splitFormattedTextToLines = (pdf: jsPDF, formattedText: Array<{text: string, style: 'normal' | 'bold' | 'italic'}>, maxWidth: number): Array<Array<{text: string, style: 'normal' | 'bold' | 'italic'}>> => {
  const lines: Array<Array<{text: string, style: 'normal' | 'bold' | 'italic'}>> = []
  let currentLine: Array<{text: string, style: 'normal' | 'bold' | 'italic'}> = []
  let currentLineWidth = 0
  
  for (const segment of formattedText) {
    if (segment.text === '\n') {
      lines.push([...currentLine])
      currentLine = []
      currentLineWidth = 0
      continue
    }
    
    const words = segment.text.split(' ')
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      const isLastWord = i === words.length - 1
      const textToAdd = isLastWord ? word : word + ' '
      
      // Set font style to measure width
      if (segment.style === 'bold') {
        pdf.setFont('helvetica', 'bold')
      } else if (segment.style === 'italic') {
        pdf.setFont('helvetica', 'italic')
      } else {
        pdf.setFont('helvetica', 'normal')
      }
      
      const wordWidth = pdf.getTextWidth(textToAdd)
      
      if (currentLineWidth + wordWidth > maxWidth && currentLine.length > 0) {
        lines.push([...currentLine])
        currentLine = [{ text: textToAdd, style: segment.style }]
        currentLineWidth = wordWidth
      } else {
        currentLine.push({ text: textToAdd, style: segment.style })
        currentLineWidth += wordWidth
      }
    }
  }
  
  if (currentLine.length > 0) {
    lines.push(currentLine)
  }
  
  return lines
}

// Helper function to render a line with mixed formatting
const renderFormattedLine = (pdf: jsPDF, line: Array<{text: string, style: 'normal' | 'bold' | 'italic'}>, x: number, y: number) => {
  let currentX = x
  
  for (const segment of line) {
    if (segment.style === 'bold') {
      pdf.setFont('helvetica', 'bold')
    } else if (segment.style === 'italic') {
      pdf.setFont('helvetica', 'italic')
    } else {
      pdf.setFont('helvetica', 'normal')
    }
    
    pdf.text(segment.text, currentX, y)
    currentX += pdf.getTextWidth(segment.text)
  }
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
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(12)
    pdf.setTextColor(100, 100, 100)
    pdf.text('My Journal', margin, yPosition)
    
    // Add date on the right
    const dateText = format(new Date(entry.created_at), 'MMMM d, yyyy')
    const dateWidth = pdf.getTextWidth(dateText)
    pdf.text(dateText, pageWidth - margin - dateWidth, yPosition)
    
    yPosition += 15

    // Add title
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(24)
    pdf.setTextColor(51, 51, 51) // Dark gray
    
    // Split title into lines if needed
    const words = entry.title.split(' ')
    let currentLine = ''
    const titleLines: string[] = []
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const textWidth = pdf.getTextWidth(testLine)
      
      if (textWidth > contentWidth && currentLine) {
        titleLines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    
    if (currentLine) {
      titleLines.push(currentLine)
    }
    
    for (const line of titleLines) {
      if (yPosition > pageHeight - margin - 20) {
        pdf.addPage()
        yPosition = margin
      }
      pdf.text(line, margin, yPosition)
      yPosition += 10
    }
    
    yPosition += 10

    // Add mood if present (without emoji)
    if (entry.mood) {
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(12)
      pdf.setTextColor(100, 100, 100)
      const moodText = moodLabels[entry.mood] || entry.mood
      pdf.text(`Mood: ${moodText}`, margin, yPosition)
      yPosition += 10
    }

    // Add privacy status (without emoji)
    pdf.setFontSize(10)
    pdf.setTextColor(120, 120, 120)
    const privacyText = entry.is_private ? 'Private Entry' : 'Public Entry'
    pdf.text(privacyText, margin, yPosition)
    yPosition += 15

    // Add separator line
    pdf.setDrawColor(200, 200, 200)
    pdf.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 15

    // Process content with rich text support
    const isRichText = /<[^>]*>/.test(entry.content)
    
    if (isRichText) {
      // Convert HTML to formatted text
      const formattedText = convertHtmlToFormattedText(entry.content)
      const formattedLines = splitFormattedTextToLines(pdf, formattedText, contentWidth)
      
      pdf.setFontSize(11)
      pdf.setTextColor(51, 51, 51)
      
      for (const line of formattedLines) {
        if (yPosition > pageHeight - margin - 10) {
          pdf.addPage()
          yPosition = margin
        }
        
        if (line.length > 0) {
          renderFormattedLine(pdf, line, margin, yPosition)
        }
        yPosition += 6
      }
    } else {
      // Plain text content
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      pdf.setTextColor(51, 51, 51)
      
      const words = entry.content.split(' ')
      let currentLine = ''
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word
        const textWidth = pdf.getTextWidth(testLine)
        
        if (textWidth > contentWidth && currentLine) {
          if (yPosition > pageHeight - margin - 10) {
            pdf.addPage()
            yPosition = margin
          }
          pdf.text(currentLine, margin, yPosition)
          yPosition += 6
          currentLine = word
        } else {
          currentLine = testLine
        }
      }
      
      if (currentLine) {
        if (yPosition > pageHeight - margin - 10) {
          pdf.addPage()
          yPosition = margin
        }
        pdf.text(currentLine, margin, yPosition)
      }
    }

    // Add footer with creation/update info
    const footerY = pageHeight - 15
    pdf.setFont('helvetica', 'normal')
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
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(28)
    pdf.setTextColor(51, 51, 51)
    const titleY = pageHeight / 2 - 20
    pdf.text(title, margin, titleY)
    
    pdf.setFont('helvetica', 'normal')
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
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(18)
      pdf.setTextColor(51, 51, 51)
      
      // Split title into lines if needed
      const words = entry.title.split(' ')
      let currentLine = ''
      const titleLines: string[] = []
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word
        const textWidth = pdf.getTextWidth(testLine)
        
        if (textWidth > contentWidth && currentLine) {
          titleLines.push(currentLine)
          currentLine = word
        } else {
          currentLine = testLine
        }
      }
      
      if (currentLine) {
        titleLines.push(currentLine)
      }
      
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
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      const entryDate = format(new Date(entry.created_at), 'MMMM d, yyyy')
      let metadataText = entryDate
      
      if (entry.mood) {
        const moodText = moodLabels[entry.mood] || entry.mood
        metadataText += ` • ${moodText}`
      }
      
      pdf.text(metadataText, margin, yPosition)
      yPosition += 10

      // Entry content with rich text support
      const isRichText = /<[^>]*>/.test(entry.content)
      
      pdf.setFontSize(10)
      pdf.setTextColor(51, 51, 51)
      
      if (isRichText) {
        // Convert HTML to formatted text
        const formattedText = convertHtmlToFormattedText(entry.content)
        const formattedLines = splitFormattedTextToLines(pdf, formattedText, contentWidth)
        
        for (const line of formattedLines) {
          if (yPosition > pageHeight - margin - 10) {
            pdf.addPage()
            yPosition = margin
          }
          
          if (line.length > 0) {
            renderFormattedLine(pdf, line, margin, yPosition)
          }
          yPosition += 5
        }
      } else {
        // Plain text content
        pdf.setFont('helvetica', 'normal')
        
        const words = entry.content.split(' ')
        let currentLine = ''
        
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word
          const textWidth = pdf.getTextWidth(testLine)
          
          if (textWidth > contentWidth && currentLine) {
            if (yPosition > pageHeight - margin - 10) {
              pdf.addPage()
              yPosition = margin
            }
            pdf.text(currentLine, margin, yPosition)
            yPosition += 5
            currentLine = word
          } else {
            currentLine = testLine
          }
        }
        
        if (currentLine) {
          if (yPosition > pageHeight - margin - 10) {
            pdf.addPage()
            yPosition = margin
          }
          pdf.text(currentLine, margin, yPosition)
          yPosition += 5
        }
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