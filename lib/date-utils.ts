// Utility functions for date formatting with error handling

export const formatDate = (dateString: string | Date): string => {
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString)
    if (isNaN(date.getTime())) {
      // If it's not a valid date, return the original string or a fallback
      return typeof dateString === 'string' ? dateString : 'Invalid Date'
    }
    return date.toLocaleDateString()
  } catch {
    return typeof dateString === 'string' ? dateString : 'Invalid Date'
  }
}

export const formatTime = (dateString: string | Date): string => {
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString)
    if (isNaN(date.getTime())) {
      return typeof dateString === 'string' ? dateString : 'Invalid Time'
    }
    return date.toLocaleTimeString()
  } catch {
    return typeof dateString === 'string' ? dateString : 'Invalid Time'
  }
}

export const formatDateTime = (dateString: string | Date): string => {
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString)
    if (isNaN(date.getTime())) {
      return typeof dateString === 'string' ? dateString : 'Invalid DateTime'
    }
    return date.toLocaleString()
  } catch {
    return typeof dateString === 'string' ? dateString : 'Invalid DateTime'
  }
}

export const formatTimeWithOptions = (
  dateString: string | Date, 
  options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" }
): string => {
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString)
    if (isNaN(date.getTime())) {
      return typeof dateString === 'string' ? dateString : 'Invalid Time'
    }
    return date.toLocaleTimeString([], options)
  } catch {
    return typeof dateString === 'string' ? dateString : 'Invalid Time'
  }
}
