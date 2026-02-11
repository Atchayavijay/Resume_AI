import { NextRequest, NextResponse } from 'next/server';
import { getResumesCollection, isMongoDBConfigured } from '@/lib/mongodb';
import type { ResumeData } from '@/lib/types';
import { ObjectId } from 'mongodb';
import { getUserIdFromRequest } from '@/lib/auth/withAuth';

/**
 * GET /api/resumes
 * Get all resumes for the authenticated user (or a specific resume by ID)
 */
export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!isMongoDBConfigured()) {
      return NextResponse.json(
        { error: 'MongoDB is not configured. Please add MONGODB_URI to .env.local' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('id');

    const collection = await getResumesCollection();

    if (resumeId) {
      const resume = await collection.findOne({
        _id: new ObjectId(resumeId),
        userId,
      });

      if (!resume) {
        return NextResponse.json(
          { error: 'Resume not found' },
          { status: 404 }
        );
      }

      const { _id, userId: _, ...resumeData } = resume;
      return NextResponse.json({ ...resumeData, id: _id.toString() });
    } else {
      const resumes = await collection
        .find({ userId })
        .sort({ updatedAt: -1 })
        .toArray();

      const formattedResumes = resumes.map((resume) => {
        const { _id, userId: _, ...resumeData } = resume;
        return { ...resumeData, id: _id.toString() };
      });

      return NextResponse.json(formattedResumes);
    }
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/resumes
 * Create a new resume for the authenticated user
 */
export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!isMongoDBConfigured()) {
      return NextResponse.json(
        { error: 'MongoDB is not configured. Please add MONGODB_URI to .env.local' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { ...resumeData } = body;

    const collection = await getResumesCollection();

    const now = new Date();
    const result = await collection.insertOne({
      ...resumeData,
      userId,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        id: result.insertedId.toString(),
        message: 'Resume created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating resume:', error);
    return NextResponse.json(
      { error: 'Failed to create resume' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/resumes
 * Update an existing resume
 */
export async function PUT(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!isMongoDBConfigured()) {
      return NextResponse.json(
        { error: 'MongoDB is not configured. Please add MONGODB_URI to .env.local' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { id, ...resumeData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }

    const collection = await getResumesCollection();

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      {
        $set: {
          ...resumeData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    const { _id, userId: _, ...updatedResume } = result;
    return NextResponse.json({
      ...updatedResume,
      id: _id.toString(),
      message: 'Resume updated successfully',
    });
  } catch (error) {
    console.error('Error updating resume:', error);
    return NextResponse.json(
      { error: 'Failed to update resume' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/resumes
 * Delete a resume
 */
export async function DELETE(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!isMongoDBConfigured()) {
      return NextResponse.json(
        { error: 'MongoDB is not configured. Please add MONGODB_URI to .env.local' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('id');

    if (!resumeId) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }

    const collection = await getResumesCollection();

    const result = await collection.deleteOne({
      _id: new ObjectId(resumeId),
      userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    );
  }
}
