import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'

Font.register({
  family: 'Inter',
  src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf',
})

Font.register({
  family: 'Inter-Bold',
  src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf',
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 11,
    lineHeight: 1.5,
    color: '#333333',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 20,
    color: '#111111',
  },
  h1: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#111111',
  },
  h2: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    marginTop: 12,
    marginBottom: 8,
    color: '#222222',
  },
  h3: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    marginTop: 10,
    marginBottom: 6,
    color: '#333333',
  },
  paragraph: {
    marginBottom: 10,
  },
  bold: {
    fontFamily: 'Inter-Bold',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bulletPoint: {
    width: 15,
    fontSize: 12,
  },
  itemContent: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#888888',
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    paddingTop: 10,
  },
})

interface PDFDocumentProps {
  title: string
  content: string
}

const parseMarkdownToComponents = (markdownText: string) => {
  if (!markdownText) return null

  const lines = markdownText.split('\n')
  const components = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    if (line.startsWith('# ')) {
      components.push(
        <Text key={i} style={styles.h1}>
          {line.substring(2).replace(/\*\*/g, '')}
        </Text>,
      )
    } else if (line.startsWith('## ')) {
      components.push(
        <Text key={i} style={styles.h2}>
          {line.substring(3).replace(/\*\*/g, '')}
        </Text>,
      )
    } else if (line.startsWith('### ')) {
      components.push(
        <Text key={i} style={styles.h3}>
          {line.substring(4).replace(/\*\*/g, '')}
        </Text>,
      )
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const textContent = line.substring(2)
      const segments = textContent.split(/(\*\*.*?\*\*)/g)

      components.push(
        <View key={i} style={styles.listItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.itemContent}>
            {segments.map((segment, idx) => {
              if (segment.startsWith('**') && segment.endsWith('**')) {
                return (
                  <Text key={`bold-${idx}`} style={styles.bold}>
                    {segment.substring(2, segment.length - 2)}
                  </Text>
                )
              }
              return segment
            })}
          </Text>
        </View>,
      )
    } else {
      const segments = line.split(/(\*\*.*?\*\*)/g)

      components.push(
        <Text key={i} style={styles.paragraph}>
          {segments.map((segment, idx) => {
            if (segment.startsWith('**') && segment.endsWith('**')) {
              return (
                <Text key={`bold-${idx}`} style={styles.bold}>
                  {segment.substring(2, segment.length - 2)}
                </Text>
              )
            }
            return segment
          })}
        </Text>,
      )
    }
  }

  return components
}

export const SummaryPDFDocument = ({ title, content }: PDFDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{title}</Text>
      {parseMarkdownToComponents(content)}
    </Page>
  </Document>
)
