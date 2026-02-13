import Image from 'next/image';
import { Icon } from '@iconify/react';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PrintToolbar } from './print-toolbar';

interface PlaybookStep {
  order: number;
  title: string;
  phase?: string;
  time_window?: string;
  intervention_duration?: string;
  owner?: string;
  success_signal?: string;
  challenge_id?: string;
  challenge_title?: string;
  method_id?: string;
  method_name?: string;
  intervention: string;
  script_template: string;
  run_in_metodic_url?: string;
}

interface ExtendedPrintableContent {
  version?: number;
  generated_at?: string;
  model?: string;
  title?: string;
  subtitle?: string;
  executive_summary?: string;
  challenge_analysis?: {
    context?: string;
    symptoms?: string[];
    root_causes?: string[];
    stakes?: string;
  };
  theory_foundations?: Array<{
    concept?: string;
    explanation?: string;
    application?: string;
  }>;
  detailed_steps?: Array<{
    step_order?: number;
    objective?: string;
    deep_explanation?: string;
    facilitator_guidance?: string;
    practical_example?: string;
    risks_and_mitigations?: string;
    success_metrics?: string;
  }>;
  implementation_roadmap?: {
    first_30_days?: string[];
    days_31_60?: string[];
    days_61_90?: string[];
    governance_and_review?: string;
  };
  case_examples?: Array<{
    title?: string;
    context?: string;
    intervention?: string;
    outcome?: string;
  }>;
  final_metodic_cta?: {
    why_metodic?: string;
    benefits?: string[];
  };
  sources?: Array<{
    title?: string;
    url?: string;
    publisher?: string;
    relevance_note?: string;
  }>;
}

interface Playbook {
  id: string;
  slug: string;
  title: string;
  category: string;
  organizational_challenge: string;
  summary: string | null;
  target_audience: string | null;
  estimated_duration: string | null;
  sequence: PlaybookStep[];
  extended_printable: ExtendedPrintableContent | null;
  generated_from: {
    transformation_horizon?: string;
    cadence?: string;
    review_checkpoint?: string;
    printable_extended?: boolean;
  } | null;
}

interface ChallengeDetail {
  title: string;
  description: string | null;
  symptoms: string[] | null;
  causes: string[] | null;
}

interface MethodDetail {
  name: string;
  description: string | null;
  when_to_use: string | null;
  how_it_works: string | null;
}

async function getPlaybook(slug: string): Promise<Playbook | null> {
  const { data, error } = await supabase
    .from('education_playbooks')
    .select('id, slug, title, category, organizational_challenge, summary, target_audience, estimated_duration, sequence, extended_printable, generated_from')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) return null;

  return {
    ...(data as Omit<Playbook, 'sequence' | 'generated_from'>),
    sequence: Array.isArray(data.sequence) ? (data.sequence as PlaybookStep[]) : [],
    extended_printable: (data.extended_printable as ExtendedPrintableContent) || null,
    generated_from: data.generated_from as Playbook['generated_from'],
  };
}

async function getReferencedDetails(playbook: Playbook) {
  const challengeIds = Array.from(
    new Set(
      playbook.sequence
        .map((step) => step.challenge_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  const methodIds = Array.from(
    new Set(
      playbook.sequence
        .map((step) => step.method_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  const [challengeRes, methodRes] = await Promise.all([
    challengeIds.length > 0
      ? supabase
          .from('education_challenges')
          .select('title, description, symptoms, causes')
          .in('id', challengeIds)
      : Promise.resolve({ data: [] as ChallengeDetail[] }),
    methodIds.length > 0
      ? supabase
          .from('education_methods')
          .select('name, description, when_to_use, how_it_works')
          .in('id', methodIds)
      : Promise.resolve({ data: [] as MethodDetail[] }),
  ]);

  const challenges = (challengeRes.data || []) as ChallengeDetail[];
  const methods = (methodRes.data || []) as MethodDetail[];

  const challengeByTitle = new Map(challenges.map((c) => [c.title, c]));
  const methodByName = new Map(methods.map((m) => [m.name, m]));

  return { challengeByTitle, methodByName };
}

function normalizePhase(step: PlaybookStep, index: number): string {
  if (step.phase) return step.phase;
  if (index === 0) return 'Diagnose';
  if (index === 1) return 'Align';
  if (index === 2) return 'Pilot';
  return 'Embed';
}

export default async function PrintablePlaybookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const playbook = await getPlaybook(slug);

  if (!playbook) notFound();

  const { challengeByTitle, methodByName } = await getReferencedDetails(playbook);
  const extended = playbook.extended_printable;
  const generatedOn = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const keySymptoms = Array.from(
    new Set(
      playbook.sequence.flatMap((step) => {
        const challenge = step.challenge_title ? challengeByTitle.get(step.challenge_title) : undefined;
        return (challenge?.symptoms || []).slice(0, 2);
      })
    )
  ).slice(0, 8);

  const keyCauses = Array.from(
    new Set(
      playbook.sequence.flatMap((step) => {
        const challenge = step.challenge_title ? challengeByTitle.get(step.challenge_title) : undefined;
        return (challenge?.causes || []).slice(0, 2);
      })
    )
  ).slice(0, 8);

  return (
    <div className="print-shell">
      <style>{`
        @page { size: A4; margin: 18mm; }
        .print-shell { background: #f4f5f7; color: #111827; }
        body > header, body > footer { display: none !important; }
        main { padding: 0 !important; margin: 0 !important; }
        .doc-wrap { max-width: 900px; margin: 0 auto; padding: 24px 0 64px; }
        .toolbar { position: sticky; top: 0; z-index: 20; display: flex; gap: 12px; justify-content: center; padding: 12px; background: rgba(245,246,248,0.95); border-bottom: 1px solid #d1d5db; }
        .toolbar a, .toolbar button { border: 1px solid #d1d5db; background: #fff; padding: 8px 14px; border-radius: 8px; font-size: 14px; cursor: pointer; text-decoration: none; color: #111827; }
        .page { background: #fff; min-height: 260mm; margin: 16px auto; box-shadow: 0 10px 28px rgba(0,0,0,0.08); padding: 28px; page-break-after: always; position: relative; overflow: hidden; }
        .page:last-child { page-break-after: auto; }
        .page::before { content: ""; position: absolute; top: 0; right: 0; width: 220px; height: 220px; background: radial-gradient(circle at top right, rgba(15,23,42,0.06), transparent 70%); }
        .cover { display: flex; flex-direction: column; justify-content: space-between; background: linear-gradient(180deg, #ffffff 0%, #fbfbfc 100%); }
        .badge { display: inline-flex; align-items: center; gap: 6px; border: 1px solid #d1d5db; border-radius: 999px; padding: 4px 10px; font-size: 12px; margin-right: 8px; margin-top: 8px; background: #fff; }
        .section-kicker { letter-spacing: 0.08em; font-size: 11px; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; font-weight: 600; }
        .header-line { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        h1 { font-size: 40px; line-height: 1.1; margin: 8px 0 14px; font-family: "Georgia", "Times New Roman", serif; }
        h2 { font-size: 26px; margin: 0 0 12px; font-family: "Georgia", "Times New Roman", serif; }
        h3 { font-size: 18px; margin: 14px 0 8px; }
        p, li { font-size: 14px; line-height: 1.65; }
        ul { margin: 8px 0 0 18px; }
        .muted { color: #4b5563; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .step-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; margin-top: 12px; background: #fafafa; }
        .line { height: 1px; background: #e5e7eb; margin: 10px 0; }
        .logo { display: flex; align-items: center; gap: 10px; }
        .small { font-size: 12px; color: #6b7280; }
        .cta-box { border: 2px solid #111827; border-radius: 12px; padding: 16px; margin-top: 20px; background: linear-gradient(180deg, #fff, #f8fafc); }
        .lead-dropcap::first-letter { float: left; font-size: 44px; line-height: 0.9; padding-right: 8px; font-family: "Georgia", "Times New Roman", serif; font-weight: 700; color: #111827; }
        .kpi-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; }
        .kpi-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; background: #fff; }
        .kpi-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.06em; }
        .kpi-value { font-size: 14px; margin-top: 4px; font-weight: 600; }
        .source-item { margin-bottom: 8px; break-inside: avoid; }
        .source-grid { columns: 2; column-gap: 24px; }
        @media print {
          .print-shell { background: #fff; }
          .doc-wrap { padding: 0; max-width: none; }
          .toolbar { display: none; }
          .page { box-shadow: none; margin: 0; min-height: auto; }
        }
      `}</style>

      <PrintToolbar
        backHref={`/playbooks/${playbook.slug}`}
        downloadHref={`/playbooks/${playbook.slug}/download`}
      />

      <div className="doc-wrap">
        {/* 1. Cover */}
        <section className="page cover">
          <div>
            <div className="logo">
              <Image src="/metodic-logo.png" alt="Metodic" width={34} height={34} />
              <strong>METODIC | learn</strong>
            </div>
            <div className="section-kicker" style={{ marginTop: 20 }}>Extended Intervention Edition</div>
            <div style={{ marginTop: 20 }}>
              <span className="badge"><Icon icon="carbon:document-pdf" width="14" height="14" /> Printable Extended Playbook</span>
              <span className="badge"><Icon icon="carbon:tag" width="14" height="14" /> {playbook.category}</span>
            </div>
            <h1>{extended?.title || playbook.title}</h1>
            <p className="muted">{extended?.subtitle || playbook.summary || playbook.organizational_challenge}</p>
            <div style={{ marginTop: 14 }}>
              <span className="badge"><Icon icon="carbon:time" width="14" height="14" /> {playbook.generated_from?.transformation_horizon || '6-10 weeks'}</span>
              <span className="badge"><Icon icon="carbon:calendar" width="14" height="14" /> {playbook.generated_from?.cadence || 'weekly cadence'}</span>
              <span className="badge"><Icon icon="carbon:timer" width="14" height="14" /> {playbook.estimated_duration || '45-90 min per intervention'}</span>
            </div>
            <div className="kpi-strip">
              <div className="kpi-card">
                <div className="kpi-label">Audience</div>
                <div className="kpi-value">{playbook.target_audience || 'Leaders and facilitators'}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Steps</div>
                <div className="kpi-value">{playbook.sequence.length} interventions</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Checkpoint</div>
                <div className="kpi-value">{playbook.generated_from?.review_checkpoint || 'Week 4'}</div>
              </div>
            </div>
          </div>
          <div className="small">
            Generated on {generatedOn} | Source: METODIC learn content library (challenges, methods, playbooks)
          </div>
        </section>

        {/* 2. Executive summary */}
        <section className="page">
          <div className="header-line"><Icon icon="carbon:summary-kpi" width="18" height="18" /><h2>Executive Summary</h2></div>
          <p className="lead-dropcap">
            {extended?.executive_summary ||
              "This extended playbook is designed for leaders and facilitators who need to address a larger team or organizational challenge through multiple phases, not a single workshop. It combines practical interventions with facilitation scripts, role ownership, and success signals."}
          </p>
          <h3>Challenge Focus</h3>
          <p>{extended?.challenge_analysis?.context || playbook.organizational_challenge}</p>
          <h3>What This Playbook Delivers</h3>
          <ul>
            <li>Clear phase-based intervention pathway: Diagnose, Align, Pilot, Embed</li>
            <li>Actionable scripts and facilitation prompts for each step</li>
            <li>Observable success signals to track adoption and behavior change</li>
            <li>Built-in checkpoints and cadence for execution discipline</li>
          </ul>
        </section>

        {/* 3. Challenge landscape */}
        <section className="page">
          <div className="header-line"><Icon icon="carbon:search-locate" width="18" height="18" /><h2>Challenge Landscape</h2></div>
          <p className="muted">Generated from linked challenge content in the METODIC learn library.</p>
          <div className="grid-2">
            <div>
              <h3>Common Symptoms</h3>
              <ul>
                {((extended?.challenge_analysis?.symptoms && extended.challenge_analysis.symptoms.length > 0)
                  ? extended.challenge_analysis.symptoms
                  : keySymptoms.length > 0
                    ? keySymptoms
                    : ['Low alignment across teams', 'Repeated decision loops', 'Action follow-through gaps']).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Likely Root Causes</h3>
              <ul>
                {((extended?.challenge_analysis?.root_causes && extended.challenge_analysis.root_causes.length > 0)
                  ? extended.challenge_analysis.root_causes
                  : keyCauses.length > 0
                    ? keyCauses
                    : ['Unclear decision rights', 'Weak meeting structures', 'Inconsistent accountability']).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          {extended?.challenge_analysis?.stakes && (
            <>
              <h3>Why This Matters</h3>
              <p>{extended.challenge_analysis.stakes}</p>
            </>
          )}
        </section>

        {/* 4. Theory page */}
        <section className="page">
          <div className="header-line"><Icon icon="carbon:education" width="18" height="18" /><h2>Working Theory Behind This Playbook</h2></div>
          <p>
            Sustainable change in meetings and interventions usually fails when teams jump to solutions before diagnosis, or when
            interventions are not reinforced over time. This playbook applies a phased behavior-change model to improve reliability.
          </p>
          <h3>Design Principles</h3>
          {extended?.theory_foundations && extended.theory_foundations.length > 0 ? (
            <ul>
              {extended.theory_foundations.map((item, idx) => (
                <li key={`${item.concept || 'concept'}-${idx}`}>
                  <strong>{item.concept || 'Foundation'}:</strong> {item.explanation} {item.application ? `Application: ${item.application}` : ''}
                </li>
              ))}
            </ul>
          ) : (
            <ul>
              <li><strong>Sequence over single event:</strong> outcomes improve when interventions build on each other.</li>
              <li><strong>Role clarity:</strong> clear ownership reduces ambiguity and drift after sessions.</li>
              <li><strong>Visible signals:</strong> teams sustain change when progress is measured with concrete indicators.</li>
              <li><strong>Facilitation rigor:</strong> scripts and structure improve equity, quality, and speed of decision-making.</li>
            </ul>
          )}
          <p className="small">
            Source note: This framework synthesizes practical facilitation patterns from METODIC challenge and methods content.
          </p>
        </section>

        {/* 5-7. Detailed step pages */}
        {playbook.sequence.map((step, index) => {
          const challenge = step.challenge_title ? challengeByTitle.get(step.challenge_title) : undefined;
          const method = step.method_name ? methodByName.get(step.method_name) : undefined;
          const extendedStep = extended?.detailed_steps?.find((item) => item.step_order === step.order);
          return (
            <section className="page" key={`${step.order}-${step.title}`}>
              <div className="header-line"><Icon icon="carbon:workflow-automation" width="18" height="18" /><h2>{extendedStep?.objective || step.title}</h2></div>
              <div>
                <span className="badge">Phase: {normalizePhase(step, index)}</span>
                <span className="badge">{step.time_window || `Week ${index + 1}`}</span>
                <span className="badge">{step.intervention_duration || playbook.estimated_duration || '45-90 min'}</span>
              </div>

              <div className="step-card">
                <h3>Intervention Goal</h3>
                <p>{extendedStep?.deep_explanation || step.intervention}</p>
                <div className="line" />
                <h3>Facilitator Script</h3>
                <p>{extendedStep?.facilitator_guidance || step.script_template}</p>
              </div>

              <div className="grid-2">
                <div>
                  <h3>Detailed Facilitation Guidance</h3>
                  {extendedStep?.practical_example ? (
                    <>
                      <p><strong>Practical example:</strong> {extendedStep.practical_example}</p>
                      <p><strong>Risks and mitigations:</strong> {extendedStep.risks_and_mitigations || 'Track blockers and assign mitigation owners.'}</p>
                    </>
                  ) : (
                    <ul>
                      <li><strong>Preparation:</strong> clarify desired outcome and stakeholders in advance.</li>
                      <li><strong>In-session:</strong> maintain participation equity and explicit decision language.</li>
                      <li><strong>Close:</strong> capture owners, deadlines, and risk assumptions.</li>
                      <li><strong>Follow-up:</strong> verify signal of adoption within next cycle.</li>
                    </ul>
                  )}
                </div>
                <div>
                  <h3>Applied Context</h3>
                  <p><strong>Challenge:</strong> {step.challenge_title || 'Related challenge from this playbook'}</p>
                  {challenge?.description && <p><strong>Challenge detail:</strong> {challenge.description}</p>}
                  <p><strong>Method:</strong> {step.method_name || 'Context-specific intervention'}</p>
                  {method?.when_to_use && <p><strong>When to use:</strong> {method.when_to_use}</p>}
                </div>
              </div>

              <div className="step-card">
                <h3>Ownership and Success Signal</h3>
                <p><strong>Owner:</strong> {step.owner || 'Session lead'}</p>
                <p><strong>Success signal:</strong> {extendedStep?.success_metrics || step.success_signal || 'Observable progress in behavior, decisions, and follow-through'}</p>
              </div>
            </section>
          );
        })}

        {/* 8. Examples */}
        <section className="page">
          <div className="header-line"><Icon icon="carbon:skill-level" width="18" height="18" /><h2>Examples and Application Scenarios</h2></div>
          {extended?.case_examples && extended.case_examples.length > 0 ? (
            extended.case_examples.map((example, idx) => (
              <div key={`${example.title || 'example'}-${idx}`}>
                <h3>{example.title || `Example ${idx + 1}`}</h3>
                <p><strong>Context:</strong> {example.context || 'Team and organizational challenge context.'}</p>
                <p><strong>Intervention:</strong> {example.intervention || 'Applied intervention sequence.'}</p>
                <p><strong>Outcome:</strong> {example.outcome || 'Improved alignment and execution quality.'}</p>
              </div>
            ))
          ) : (
            <>
              <h3>Example A: Team-level reset</h3>
              <p>
                A functional team with low participation applies the first two phases over two weeks, improving contribution spread
                and reducing repeated agenda loops.
              </p>
              <h3>Example B: Cross-functional decision path</h3>
              <p>
                Product and operations teams use phase-based interventions to define decision rights and reduce reversals in delivery planning.
              </p>
              <h3>Example C: Leadership alignment cycle</h3>
              <p>
                Leadership teams run monthly checkpoints using the embed phase, converting workshop outputs into governance routines.
              </p>
            </>
          )}
          <p className="small">
            Source note: Examples are generated from METODIC playbook patterns and intervention logic.
          </p>
        </section>

        {/* 9. Implementation roadmap */}
        <section className="page">
          <div className="header-line"><Icon icon="carbon:roadmap" width="18" height="18" /><h2>Implementation Roadmap and Measurement</h2></div>
          <h3>90-day execution checklist</h3>
          <ul>
            {(extended?.implementation_roadmap?.first_30_days || [
              "Define playbook owner and facilitation support",
              "Schedule phase interventions with explicit cadence",
            ]).map((item) => (
              <li key={`first-${item}`}>{item}</li>
            ))}
            {(extended?.implementation_roadmap?.days_31_60 || [
              "Track success signals per step and resolve blockers quickly",
            ]).map((item) => (
              <li key={`second-${item}`}>{item}</li>
            ))}
            {(extended?.implementation_roadmap?.days_61_90 || [
              "Run checkpoint review and adapt next-cycle interventions",
            ]).map((item) => (
              <li key={`third-${item}`}>{item}</li>
            ))}
          </ul>
          {extended?.implementation_roadmap?.governance_and_review && (
            <p><strong>Governance:</strong> {extended.implementation_roadmap.governance_and_review}</p>
          )}
          <h3>Suggested metrics</h3>
          <ul>
            <li>Decision closure rate</li>
            <li>Action ownership completion rate</li>
            <li>Participation distribution across roles</li>
            <li>Perceived session usefulness score</li>
          </ul>
        </section>

        {/* 10. Final page CTA */}
        <section className="page">
          <div className="header-line"><Icon icon="carbon:rocket" width="18" height="18" /><h2>Scale This with Metodic.io</h2></div>
          <p>
            {extended?.final_metodic_cta?.why_metodic ||
              "This printable playbook gives your team a practical transformation path. To move faster and design intervention sessions with stronger consistency, Metodic.io helps you create full session agendas, methods sequencing, facilitation scripts, materials, and structured outputs in one workflow."}
          </p>
          <div className="cta-box">
            <h3>How Metodic.io helps</h3>
            <ul>
              {(extended?.final_metodic_cta?.benefits && extended.final_metodic_cta.benefits.length > 0
                ? extended.final_metodic_cta.benefits
                : [
                    "Design intervention meetings faster with proven structures",
                    "Combine challenges, methods, and scripts into complete session plans",
                    "Create reusable playbooks and facilitator assets for teams",
                  ]).map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
            <p style={{ marginTop: 12 }}>
              <a href="https://metodic.io" target="_blank" rel="noopener noreferrer">
                Explore Metodic.io →
              </a>
            </p>
          </div>
          {extended?.sources && extended.sources.length > 0 && (
            <>
              <h3 style={{ marginTop: 20 }}>Research sources</h3>
              <ul className="source-grid">
                {extended.sources.map((source, idx) => (
                  <li className="source-item" key={`${source.url || source.title || 'source'}-${idx}`}>
                    <strong>{source.title || source.publisher || "Source"}:</strong>{" "}
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noopener noreferrer">{source.url}</a>
                    ) : (
                      <span>No URL provided</span>
                    )}
                    {source.relevance_note ? ` - ${source.relevance_note}` : ""}
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="small" style={{ marginTop: 14 }}>
            METODIC | learn is your open knowledge layer. Metodic.io is your execution platform for intervention design.
          </p>
        </section>
      </div>
    </div>
  );
}
