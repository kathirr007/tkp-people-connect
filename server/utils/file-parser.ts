import Papa from 'papaparse'
import ExcelJS from 'exceljs'

export interface ParsedRow {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  organization?: string
  designation?: string
  department?: string
  notes?: string
  tags?: string[]
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
}

const COLUMN_MAP: Record<string, string> = {
  'first name': 'firstName',
  'firstname': 'firstName',
  'first_name': 'firstName',
  'last name': 'lastName',
  'lastname': 'lastName',
  'last_name': 'lastName',
  'email': 'email',
  'email address': 'email',
  'phone': 'phone',
  'phone number': 'phone',
  'phone_number': 'phone',
  'organization': 'organization',
  'company': 'organization',
  'org': 'organization',
  'designation': 'designation',
  'title': 'designation',
  'job title': 'designation',
  'job_title': 'designation',
  'department': 'department',
  'dept': 'department',
  'notes': 'notes',
  'tags': 'tags',
  'street': 'address.street',
  'address': 'address.street',
  'city': 'address.city',
  'state': 'address.state',
  'zip': 'address.zipCode',
  'zip code': 'address.zipCode',
  'zipcode': 'address.zipCode',
  'zip_code': 'address.zipCode',
  'postal code': 'address.zipCode',
  'country': 'address.country',
}

function normalizeColumnName(name: string): string {
  return COLUMN_MAP[name.toLowerCase().trim()] || name.toLowerCase().trim()
}

function mapRowToPersonData(raw: Record<string, string>): ParsedRow {
  const person: ParsedRow = { address: {} }

  for (const [key, value] of Object.entries(raw)) {
    if (!value || !value.trim())
      continue

    const normalizedKey = normalizeColumnName(key)
    const trimmedValue = value.trim()

    if (normalizedKey === 'tags') {
      person.tags = trimmedValue.split(',').map(t => t.trim()).filter(Boolean)
    }
    else if (normalizedKey.startsWith('address.')) {
      const addressField = normalizedKey.replace('address.', '') as keyof NonNullable<ParsedRow['address']>
      person.address![addressField] = trimmedValue
    }
    else if (normalizedKey in { firstName: 1, lastName: 1, email: 1, phone: 1, organization: 1, designation: 1, department: 1, notes: 1 }) {
      (person as Record<string, unknown>)[normalizedKey] = trimmedValue
    }
  }

  if (person.address && !Object.values(person.address).some(Boolean)) {
    delete person.address
  }

  return person
}

export async function parseCSV(content: string): Promise<ParsedRow[]> {
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim(),
  })

  return result.data.map(mapRowToPersonData)
}

export async function parseExcel(buffer: Buffer): Promise<ParsedRow[]> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)

  const worksheet = workbook.worksheets[0]
  if (!worksheet)
    return []

  const headers: string[] = []
  const rows: ParsedRow[] = []

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      row.eachCell((cell) => {
        headers.push(String(cell.value || '').trim())
      })
      return
    }

    const rawRow: Record<string, string> = {}
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber - 1]
      if (header) {
        rawRow[header] = String(cell.value || '').trim()
      }
    })

    if (Object.values(rawRow).some(v => v))
      rows.push(mapRowToPersonData(rawRow))
  })

  return rows
}

export async function parseJSON(content: string): Promise<ParsedRow[]> {
  const data = JSON.parse(content)

  if (!Array.isArray(data)) {
    throw new Error('JSON must be an array of objects')
  }

  return data.map((item: Record<string, unknown>) => {
    const row: Record<string, string> = {}
    for (const [key, value] of Object.entries(item)) {
      if (typeof value === 'object' && value !== null && key.toLowerCase() === 'address') {
        const addr = value as Record<string, string>
        for (const [ak, av] of Object.entries(addr)) {
          row[`address.${ak}`] = String(av || '')
        }
      }
      else if (Array.isArray(value)) {
        row[key] = value.join(',')
      }
      else {
        row[key] = String(value || '')
      }
    }
    return mapRowToPersonData(row)
  })
}

export function detectFormatAndParse(
  content: Buffer | string,
  filename: string,
  contentType?: string,
): Promise<ParsedRow[]> {
  const ext = filename.split('.').pop()?.toLowerCase()

  if (ext === 'csv' || contentType?.includes('csv')) {
    return parseCSV(typeof content === 'string' ? content : content.toString('utf-8'))
  }

  if (ext === 'xlsx' || ext === 'xls' || contentType?.includes('spreadsheet') || contentType?.includes('excel')) {
    return parseExcel(Buffer.isBuffer(content) ? content : Buffer.from(content))
  }

  if (ext === 'json' || contentType?.includes('json')) {
    return parseJSON(typeof content === 'string' ? content : content.toString('utf-8'))
  }

  throw new Error(`Unsupported file format: ${ext || contentType}. Supported formats: CSV, Excel (.xlsx), JSON`)
}
