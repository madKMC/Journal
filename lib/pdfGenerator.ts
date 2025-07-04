import jsPDF from 'jspdf'
import { format } from 'date-fns'
import { Database } from '@/types/database'
import { processMonitor } from './processMonitor'

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

// Helper function to generate Soul State Analytics data
const generateSoulStateData = (entries: JournalEntry[]) => {
  const totalEntries = entries.length
  const moodCounts: Record<string, number> = {}
  
  entries.forEach(entry => {
    const mood = entry.mood || 'general'
    moodCounts[mood] = (moodCounts[mood] || 0) + 1
  })

  const sortedMoods = Object.entries(moodCounts)
    .sort(([, a], [, b]) => b - a)

  // Calculate emotional balance
  const positiveMoods = ['happy', 'excited', 'peaceful', 'grateful', 'energetic']
  const challengingMoods = ['sad', 'anxious', 'overwhelmed', 'angry', 'lonely', 'burnt_out']
  const neutralMoods = ['reflective', 'general', 'numb', 'insecure']

  const positiveCount = positiveMoods.reduce((sum, mood) => sum + (moodCounts[mood] || 0), 0)
  const challengingCount = challengingMoods.reduce((sum, mood) => sum + (moodCounts[mood] || 0), 0)
  const neutralCount = neutralMoods.reduce((sum, mood) => sum + (moodCounts[mood] || 0), 0)

  return {
    totalEntries,
    sortedMoods,
    positiveCount,
    challengingCount,
    neutralCount,
    positivePercentage: totalEntries > 0 ? Math.round((positiveCount / totalEntries) * 100) : 0,
    challengingPercentage: totalEntries > 0 ? Math.round((challengingCount / totalEntries) * 100) : 0,
    neutralPercentage: totalEntries > 0 ? Math.round((neutralCount / totalEntries) * 100) : 0
  }
}

// Helper function to convert HTML to formatted text with proper structure
const convertHtmlToFormattedText = (html: string): Array<{text: string, style: 'normal' | 'bold' | 'italic', type: 'text' | 'bullet' | 'number' | 'quote' | 'newline'}> => {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  
  const result: Array<{text: string, style: 'normal' | 'bold' | 'italic', type: 'text' | 'bullet' | 'number' | 'quote' | 'newline'}> = []
  
  const processNode = (node: Node, listType?: 'ul' | 'ol', listIndex?: number) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || ''
      if (text.trim()) {
        result.push({ text: text, style: 'normal', type: 'text' })
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      const tagName = element.tagName.toLowerCase()
      
      switch (tagName) {
        case 'strong':
        case 'b':
          const boldText = element.textContent || ''
          if (boldText.trim()) {
            result.push({ text: boldText, style: 'bold', type: 'text' })
          }
          break
        case 'em':
        case 'i':
          const italicText = element.textContent || ''
          if (italicText.trim()) {
            result.push({ text: italicText, style: 'italic', type: 'text' })
          }
          break
        case 'p':
        case 'div':
          for (const child of Array.from(element.childNodes)) {
            processNode(child, listType, listIndex)
          }
          result.push({ text: '', style: 'normal', type: 'newline' })
          break
        case 'br':
          result.push({ text: '', style: 'normal', type: 'newline' })
          break
        case 'ul':
          for (const child of Array.from(element.childNodes)) {
            if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName.toLowerCase() === 'li') {
              processNode(child, 'ul')
              result.push({ text: '', style: 'normal', type: 'newline' })
            }
          }
          break
        case 'ol':
          let index = 1
          for (const child of Array.from(element.childNodes)) {
            if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName.toLowerCase() === 'li') {
              processNode(child, 'ol', index)
              result.push({ text: '', style: 'normal', type: 'newline' })
              index++
            }
          }
          break
        case 'li':
          if (listType === 'ul') {
            result.push({ text: '• ', style: 'normal', type: 'bullet' })
          } else if (listType === 'ol' && listIndex) {
            result.push({ text: `${listIndex}. `, style: 'normal', type: 'number' })
          }
          for (const child of Array.from(element.childNodes)) {
            processNode(child, listType, listIndex)
          }
          break
        case 'blockquote':
          result.push({ text: '', style: 'normal', type: 'newline' })
          const quoteText = element.textContent || ''
          if (quoteText.trim()) {
            result.push({ text: `"${quoteText.trim()}"`, style: 'italic', type: 'quote' })
          }
          result.push({ text: '', style: 'normal', type: 'newline' })
          break
        default:
          for (const child of Array.from(element.childNodes)) {
            processNode(child, listType, listIndex)
          }
          break
      }
    }
  }
  
  processNode(tmp)
  return result
}

// Helper function to split formatted text into lines that fit within a given width
const splitFormattedTextToLines = (pdf: jsPDF, formattedText: Array<{text: string, style: 'normal' | 'bold' | 'italic', type: 'text' | 'bullet' | 'number' | 'quote' | 'newline'}>, maxWidth: number): Array<Array<{text: string, style: 'normal' | 'bold' | 'italic', type: 'text' | 'bullet' | 'number' | 'quote' | 'newline'}>> => {
  const lines: Array<Array<{text: string, style: 'normal' | 'bold' | 'italic', type: 'text' | 'bullet' | 'number' | 'quote' | 'newline'}>> = []
  let currentLine: Array<{text: string, style: 'normal' | 'bold' | 'italic', type: 'text' | 'bullet' | 'number' | 'quote' | 'newline'}> = []
  let currentLineWidth = 0
  
  for (const segment of formattedText) {
    if (segment.type === 'newline') {
      lines.push([...currentLine])
      currentLine = []
      currentLineWidth = 0
      continue
    }
    
    if (segment.type === 'quote') {
      // Handle blockquotes on their own line
      if (currentLine.length > 0) {
        lines.push([...currentLine])
        currentLine = []
        currentLineWidth = 0
      }
      lines.push([segment])
      continue
    }
    
    if (segment.type === 'bullet' || segment.type === 'number') {
      // Start a new line for list items
      if (currentLine.length > 0) {
        lines.push([...currentLine])
        currentLine = []
        currentLineWidth = 0
      }
      currentLine.push(segment)
      
      // Set font style to measure width
      pdf.setFont('helvetica', 'normal')
      currentLineWidth = pdf.getTextWidth(segment.text)
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
        currentLine = [{ text: textToAdd, style: segment.style, type: segment.type }]
        currentLineWidth = wordWidth
      } else {
        currentLine.push({ text: textToAdd, style: segment.style, type: segment.type })
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
const renderFormattedLine = (pdf: jsPDF, line: Array<{text: string, style: 'normal' | 'bold' | 'italic', type: 'text' | 'bullet' | 'number' | 'quote' | 'newline'}>, x: number, y: number) => {
  let currentX = x
  
  // Check if this is a quote line
  const isQuote = line.some(segment => segment.type === 'quote')
  if (isQuote) {
    // Indent quotes
    currentX = x + 10
  }
  
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
  let pdf: jsPDF | null = null
  
  try {
    console.log('📄 [PDFGenerator] Starting PDF generation for entry:', entry.id)
    processMonitor.logMemoryUsage('PDF Generation Start')

    // Create new PDF document
    pdf = new jsPDF({
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
    pdf.text('SoulScriptJournal', margin, yPosition)
    
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
      pdf.text(`Soul State: ${moodText}`, margin, yPosition)
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
    const filename = `soulscript_entry_${dateStr}_${safeTitle}.pdf`

    // Save the PDF
    pdf.save(filename)

    console.log('✅ [PDFGenerator] PDF generated successfully:', filename)
    processMonitor.logMemoryUsage('PDF Generation Complete')

  } catch (error) {
    console.error('🚨 [PDFGenerator] Error generating PDF:', error)
    processMonitor.logMemoryUsage('PDF Generation Error')
    
    // Force garbage collection if available
    if (global.gc) {
      console.log('🧹 [PDFGenerator] Running garbage collection after error...')
      global.gc()
    }
    
    throw new Error('Failed to generate PDF')
  } finally {
    // Clean up PDF instance
    pdf = null
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }
  }
}

export const generateMultipleEntriesPDF = async (entries: JournalEntry[], title: string = 'SoulScript Journal Entries'): Promise<void> => {
  let pdf: jsPDF | null = null
  
  try {
    console.log('📄 [PDFGenerator] Starting multi-entry PDF generation for', entries.length, 'entries')
    processMonitor.logMemoryUsage('Multi-PDF Generation Start')

    pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)
    
    let yPosition = margin

    // Generate Soul State Analytics data
    const soulStateData = generateSoulStateData(entries)

    // Add title page
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(28)
    pdf.setTextColor(51, 51, 51)
    const titleY = pageHeight / 2 - 40
    pdf.text(title, margin, titleY)
    
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(14)
    pdf.setTextColor(100, 100, 100)
    pdf.text(`${entries.length} ${entries.length === 1 ? 'Entry' : 'Entries'}`, margin, titleY + 15)
    
    const dateRange = entries.length > 1 
      ? `${format(new Date(entries[entries.length - 1].created_at), 'MMM d, yyyy')} - ${format(new Date(entries[0].created_at), 'MMM d, yyyy')}`
      : format(new Date(entries[0].created_at), 'MMM d, yyyy')
    
    pdf.text(dateRange, margin, titleY + 25)

    // Add Soul State Analytics page
    if (soulStateData.totalEntries > 0) {
      pdf.addPage()
      yPosition = margin

      // Soul State Analytics Header
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(20)
      pdf.setTextColor(51, 51, 51)
      pdf.text('Soul State Analytics', margin, yPosition)
      yPosition += 15

      // Emotional Balance Section
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.text('Emotional Balance', margin, yPosition)
      yPosition += 10

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      pdf.setTextColor(80, 80, 80)
      
      pdf.text(`Positive States: ${soulStateData.positiveCount} entries (${soulStateData.positivePercentage}%)`, margin, yPosition)
      yPosition += 6
      pdf.text(`Challenging States: ${soulStateData.challengingCount} entries (${soulStateData.challengingPercentage}%)`, margin, yPosition)
      yPosition += 6
      pdf.text(`Reflective States: ${soulStateData.neutralCount} entries (${soulStateData.neutralPercentage}%)`, margin, yPosition)
      yPosition += 15

      // Top Moods Section
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.setTextColor(51, 51, 51)
      pdf.text('Most Frequent Soul States', margin, yPosition)
      yPosition += 10

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      pdf.setTextColor(80, 80, 80)

      const topMoods = soulStateData.sortedMoods.slice(0, 8)
      for (const [mood, count] of topMoods) {
        const percentage = Math.round((count / soulStateData.totalEntries) * 100)
        const moodLabel = moodLabels[mood] || mood
        pdf.text(`${moodLabel}: ${count} ${count === 1 ? 'entry' : 'entries'} (${percentage}%)`, margin, yPosition)
        yPosition += 6
        
        if (yPosition > pageHeight - margin - 20) {
          pdf.addPage()
          yPosition = margin
        }
      }

      yPosition += 10

      // Soul Insights Section
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.setTextColor(51, 51, 51)
      pdf.text('Soul Insights', margin, yPosition)
      yPosition += 10

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      pdf.setTextColor(80, 80, 80)

      const insights = [
        `You expressed yourself through ${soulStateData.totalEntries} journal ${soulStateData.totalEntries === 1 ? 'entry' : 'entries'} this period`,
        `Your most frequent emotional state was ${moodLabels[soulStateData.sortedMoods[0][0]] || soulStateData.sortedMoods[0][0]} (${soulStateData.sortedMoods[0][1]} ${soulStateData.sortedMoods[0][1] === 1 ? 'time' : 'times'})`,
        soulStateData.positiveCount > soulStateData.challengingCount 
          ? `Your soul radiated positivity with ${soulStateData.positivePercentage}% positive emotional states`
          : soulStateData.challengingCount > soulStateData.positiveCount
          ? `You navigated through challenges - remember that growth often comes through difficult times`
          : `You experienced a balanced emotional journey`,
        `You experienced ${soulStateData.sortedMoods.length} different emotional states, showing the richness of your inner journey`,
        `Each entry is a sacred step in your path of self-discovery and growth`
      ]

      for (const insight of insights) {
        // Split long insights into multiple lines
        const words = insight.split(' ')
        let currentLine = ''
        
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word
          const textWidth = pdf.getTextWidth(`• ${testLine}`)
          
          if (textWidth > contentWidth && currentLine) {
            pdf.text(`• ${currentLine}`, margin, yPosition)
            yPosition += 6
            currentLine = word
            
            if (yPosition > pageHeight - margin - 20) {
              pdf.addPage()
              yPosition = margin
            }
          } else {
            currentLine = testLine
          }
        }
        
        if (currentLine) {
          pdf.text(`• ${currentLine}`, margin, yPosition)
          yPosition += 6
          
          if (yPosition > pageHeight - margin - 20) {
            pdf.addPage()
            yPosition = margin
          }
        }
      }
    }

    // Add new page for entries
    pdf.addPage()
    yPosition = margin

    // Add entries header
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(20)
    pdf.setTextColor(51, 51, 51)
    pdf.text('Journal Entries', margin, yPosition)
    yPosition += 20

    // Process each entry
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      
      // Log progress for large batches
      if (i > 0 && i % 10 === 0) {
        console.log(`📄 [PDFGenerator] Processing entry ${i + 1}/${entries.length}`)
        processMonitor.logMemoryUsage(`Multi-PDF Progress ${i + 1}/${entries.length}`)
      }
      
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
        metadataText += ` • Soul State: ${moodText}`
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
    const filename = `soulscript_journal_entries_${dateStr}.pdf`

    // Save the PDF
    pdf.save(filename)

    console.log('✅ [PDFGenerator] Multi-entry PDF generated successfully:', filename)
    processMonitor.logMemoryUsage('Multi-PDF Generation Complete')

  } catch (error) {
    console.error('🚨 [PDFGenerator] Error generating multi-entry PDF:', error)
    processMonitor.logMemoryUsage('Multi-PDF Generation Error')
    
    // Force garbage collection if available
    if (global.gc) {
      console.log('🧹 [PDFGenerator] Running garbage collection after error...')
      global.gc()
    }
    
    throw new Error('Failed to generate PDF')
  } finally {
    // Clean up PDF instance
    pdf = null
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }
  }
}