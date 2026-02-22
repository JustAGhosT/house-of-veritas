import { NextResponse } from 'next/server'
import { createSubmission, getSubmissionStatus, isDocuSealConfigured } from '@/lib/services/docuseal'
import { logger } from '@/lib/logger'
import { withAuth } from '@/lib/auth/rbac'

// GET - Get submission status
export const GET = withAuth(async (request) => {
  const { searchParams } = new URL(request.url)
  const submissionId = searchParams.get('id')

  if (!submissionId) {
    return NextResponse.json(
      { error: 'Submission ID required' },
      { status: 400 }
    )
  }

  try {
    const submission = await getSubmissionStatus(submissionId)
    
    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      submission,
      configured: isDocuSealConfigured(),
    })
  } catch (error) {
    logger.error('Error fetching submission', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Failed to fetch submission' },
      { status: 500 }
    )
  }
})

// POST - Create new submission
export const POST = withAuth(async (request) => {
  try {
    const body = await request.json()
    const { templateId, recipients, metadata } = body

    if (!templateId || !recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Template ID and recipients are required' },
        { status: 400 }
      )
    }

    const submission = await createSubmission({
      templateId,
      recipients,
      metadata,
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Failed to create submission' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      submission,
      configured: isDocuSealConfigured(),
      message: isDocuSealConfigured()
        ? "Signature request sent via DocuSeal"
        : "Mock submission created - DocuSeal not configured",
    })
  } catch (error) {
    logger.error('Error creating submission', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    )
  }
})
