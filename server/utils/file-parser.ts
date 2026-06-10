import Papa from 'papaparse'
import ExcelJS from 'exceljs'

export interface ParsedRow {
  firstName?: string
  lastName?: string
  gender?: string
  dateOfBirth?: string
  phone?: string
  email?: string
  village?: string
  ward?: string
  address?: string
  fatherName?: string
  fatherPhone?: string
  motherName?: string
  motherPhone?: string
  maritalStatus?: string
  spouseName?: string
  spousePhone?: string
  marriageYear?: number
  numberOfChildren?: number
  notes?: string
  isAlive?: boolean
}

const COLUMN_MAP: Record<string, string> = {
  'first name': 'firstName',
  'firstname': 'firstName',
  'first_name': 'firstName',
  'last name': 'lastName',
  'lastname': 'lastName',
  'last_name': 'lastName',
  'gender': 'gender',
  'sex': 'gender',
  'date of birth': 'dateOfBirth',
  'dob': 'dateOfBirth',
  'date_of_birth': 'dateOfBirth',
  'birth date': 'dateOfBirth',
  'phone': 'phone',
  'phone number': 'phone',
  'phone_number': 'phone',
  'mobile': 'phone',
  'email': 'email',
  'email address': 'email',
  'village': 'village',
  'ward': 'ward',
  'area': 'ward',
  'address': 'address',
  'full address': 'address',
  'father name': 'fatherName',
  'father_name': 'fatherName',
  "father's name": 'fatherName',
  'father phone': 'fatherPhone',
  'father_phone': 'fatherPhone',
  'mother name': 'motherName',
  'mother_name': 'motherName',
  "mother's name": 'motherName',
  'mother phone': 'motherPhone',
  'mother_phone': 'motherPhone',
  'marital status': 'maritalStatus',
  'marital_status': 'maritalStatus',
  'spouse name': 'spouseName',
  'spouse_name': 'spouseName',
  "spouse's name": 'spouseName',
  'spouse phone': 'spousePhone',
  'spouse_phone': 'spousePhone',
  'marriage year': 'marriageYear',
  'marriage_year': 'marriageYear',
  'number of children': 'numberOfChildren',
  'number_of_children': 'numberOfChildren',
  'children': 'numberOfChildren',
  'notes': 'notes',
  'remarks': 'notes',
  'alive': 'isAlive',
  'is alive': 'isAlive',
  'is_alive': 'isAlive',
}

const SIMPLE_FIELDS = new Set([
  'firstName', 'lastName', 'gender', 'dateOfBirth', 'phone', 'email',
  'village', 'ward', 'address', 'fatherName', 'fatherPhone', 'motherName',
  'motherPhone', 'maritalStatus', 'spouseName', 'spousePhone', 'notes',
])

function normalizeColumnName(name: string): string {
  return COLUMN_MAP[name.toLowerCase().trim()] || name.toLowerCase().trim()
}

function mapRowToPersonData(raw: Record<string, string>): ParsedRow {
  const person: ParsedRow = {}

  for (const [key, value] of Object.entries(raw)) {
    if (!value || !value.trim()) continue
    const mappedKey = normalizeColumnName(key)
    const trimmedValue = value.trim()

    if (SIMPLE_FIELDS.has(mappedKey)) {
      (person as Record<string, unknown>)[mappedKey] = trimmedValue
    }
    else if (mappedKey === 'marriageYear' || mappedKey === 'numberOfChildren') {
      const num = Number(trimmedValue)
      if (!Number.isNaN(num)) (person as Record<string, unknown>)[mappedKey] = num
    }
    else if (mappedKey === 'isAlive') {
      person.isAlive = trimmedValue.toLowerCase() !== 'false' && trimmedValue !== '0'
    }
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
      if (Array.isArray(value)) {
        row[key] = value.join(',')
      }
      else {
        row[key] = String(value ?? '')
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
