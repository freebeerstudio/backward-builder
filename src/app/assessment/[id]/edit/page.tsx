import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { assessments, questions } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { Header } from '@/components/layout/Header';
import { PageContainer } from '@/components/layout/PageContainer';
import { QuestionList } from '@/components/assessment/QuestionList';
import type { Question } from '@/types';

export const metadata = {
  title: 'Edit Assessment',
  description: 'Review and edit your generated assessment questions.',
};

export default async function AssessmentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch the assessment directly from DB (server component)
  const assessment = await db.query.assessments.findFirst({
    where: eq(assessments.id, id),
  });

  if (!assessment) {
    notFound();
  }

  // Fetch all questions ordered by orderIndex
  const assessmentQuestions = await db.query.questions.findMany({
    where: eq(questions.assessmentId, id),
    orderBy: [asc(questions.orderIndex)],
  });

  // Map DB rows to the Question type expected by client components
  const mappedQuestions: Question[] = assessmentQuestions.map((q) => ({
    id: q.id,
    assessmentId: q.assessmentId,
    type: q.type,
    orderIndex: q.orderIndex,
    questionText: q.questionText,
    points: q.points,
    options: q.options as Question['options'],
    sourceDocument: q.sourceDocument ?? undefined,
    sourceAttribution: q.sourceAttribution ?? undefined,
    scaffoldingQuestions: q.scaffoldingQuestions as Question['scaffoldingQuestions'],
    rubric: q.rubric as Question['rubric'],
    sampleAnswer: q.sampleAnswer ?? undefined,
  }));

  const totalPoints = mappedQuestions.reduce((sum, q) => sum + q.points, 0);

  return (
    <main className="flex flex-col min-h-screen bg-warmwhite">
      <Header />

      <PageContainer wide className="py-8">
        {/* Top bar: Back link + Publish CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 text-sm font-body text-text-light hover:text-forest transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Create
          </Link>

          <Link
            href={`/assessment/${id}/publish`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold text-forest-dark font-heading font-medium px-6 py-2.5 text-base hover:bg-gold-light active:bg-gold transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Publish Assessment
          </Link>
        </div>

        {/* Assessment metadata */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-text mb-2">
            {assessment.title}
          </h1>
          {assessment.description && (
            <p className="text-sm font-body text-text-light mb-4 leading-relaxed max-w-2xl">
              {assessment.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-sm font-body text-text-light">
            {assessment.gradeLevel && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Grade {assessment.gradeLevel}
              </span>
            )}
            {assessment.topic && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {assessment.topic}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-forest/10 text-forest px-3 py-1 font-medium">
              {totalPoints} total points
            </span>
          </div>
        </div>

        {/* Questions */}
        <QuestionList
          initialQuestions={mappedQuestions}
          assessmentId={id}
        />
      </PageContainer>
    </main>
  );
}
