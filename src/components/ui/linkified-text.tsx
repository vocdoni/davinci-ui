import React from 'react'

interface LinkifiedTextProps {
  text: string
  className?: string
}

/**
 * Component that automatically detects URLs in text and converts them to clickable links.
 * Supports http://, https://, and www. prefixed URLs.
 */
export function LinkifiedText({ text, className = '' }: LinkifiedTextProps) {
  // Regex pattern to detect URLs
  // Matches: http://..., https://..., www....
  const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/g

  const parts: string[] = []
  const matches: string[] = []
  let lastIndex = 0
  let match

  // Extract all matches and parts
  while ((match = urlPattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    
    // Clean the URL by removing trailing punctuation
    let url = match[0]
    let trailingPunctuation = ''
    
    // Strip common trailing punctuation that's likely not part of the URL
    // This handles cases like: (https://example.com) or https://example.com.
    const punctuationMatch = url.match(/([)\].,!?;:]+)$/)
    if (punctuationMatch) {
      trailingPunctuation = punctuationMatch[1]
      url = url.slice(0, -trailingPunctuation.length)
    }
    
    // Add the cleaned URL
    parts.push(url)
    matches.push(url)
    
    // Add the trailing punctuation as separate text if it exists
    if (trailingPunctuation) {
      parts.push(trailingPunctuation)
    }
    
    lastIndex = match.index + match[0].length
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  // If no matches found, return the original text
  if (matches.length === 0) {
    return <span className={className}>{text}</span>
  }

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part is a URL
        const isUrl = matches.includes(part)

        if (isUrl) {
          // Add https:// prefix if URL starts with www.
          const href = part.startsWith('www.') ? `https://${part}` : part

          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          )
        }

        return <React.Fragment key={index}>{part}</React.Fragment>
      })}
    </span>
  )
}
