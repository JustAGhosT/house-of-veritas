import { NextResponse } from 'next/server'
import { getTemplates, isDocuSealConfigured } from '@/lib/services/docuseal'

export async function GET() {
  try {
    const templates = await getTemplates()
    
    return NextResponse.json({
      templates,
      configured: isDocuSealConfigured(),
      message: isDocuSealConfigured() 
        ? "Connected to DocuSeal" 
        : "Using mock data - DocuSeal not configured"
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}
