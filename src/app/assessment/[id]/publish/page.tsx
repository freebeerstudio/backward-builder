import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { assessments, questions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Header } from '@/components/layout/Header';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { PublishButton } from './PublishButton';
import { ShareLinkDisplay } from './ShareLinkDisplay';

export const metadata = {
  title: 'Publish Assessment',
  description: 'Publish your assessment and share it with students.',
};

export default async function PublishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const assessment = await db.query.assessments.findFirst({
    where: eq(assessments.id, id),
  });

  if (!assessment) {
    notFound();
  }

  const questionCount = await db.$count(
    questions,
    eq(questions.assessmentId, id)
  );

  const isPublished = assessment.status === 'published' && assessment.shareCode;

  return (
    <main className="flex flex-col min-h-screen bg-warmwhite">
      <Header />

      <PageContainer className="py-8">
        {/* Back link */}
        <Link
          href={`/assessment/${id}/edit`}
          className="inline-flex items-center gap-1.5 text-sm font-body text-text-light hover:text-forest transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Edit
        </Link>

        <div className="max-w-lg mx-auto">
          <Card className="text-center">
            {isPublished ? (
              /* Already published */
              <>
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-heading font-bold text-text mb-2">
                  Assessment Published
                </h1>
                <p className="text-sm font-body text-text-light mb-6 leading-relaxed">
                  Your assessment &ldquo;{assessment.title}&rdquo; is live.
                  Share the link below with your students.
                </p>
                <ShareLinkDisplay shareCode={assessment.shareCode!} />
              </>
            ) : (
              /* Draft — show publish confirmation */
              <>
                <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h1 className="text-2xl font-heading font-bold text-text mb-2">
                  Ready to Publish?
                </h1>
                <p className="text-sm font-body text-text-light mb-2 leading-relaxed">
                  You&apos;re about to publish &ldquo;{assessment.title}&rdquo;.
                </p>

                {/* Assessment summary */}
                <div className="flex items-center justify-center gap-4 text-sm font-body text-text-light mb-6">
                  <span>{questionCount} question{questionCount !== 1 ? 's' : ''}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span>{assessment.totalPoints} total points</span>
                  {assessment.gradeLevel && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span>Grade {assessment.gradeLevel}</span>
                    </>
                  )}
                </div>

                <p className="text-xs font-body text-text-light mb-6">
                  Once published, students will be able to access the assessment
                  via a unique share link. You can still view results afterward.
                </p>

                <PublishButton assessmentId={id} />
              </>
            )}
          </Card>
        </div>
      </PageContainer>
    </main>
  );
}
