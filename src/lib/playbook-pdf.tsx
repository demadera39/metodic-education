import type { ReactNode } from 'react';
import {
  Document,
  Image,
  Link,
  Page,
  StyleSheet,
  Svg,
  Path,
  Text,
  View,
  pdf,
} from '@react-pdf/renderer';
import path from 'path';
import fs from 'fs';

// ── Types ────────────────────────────────────────────────────────────────

export interface PlaybookStep {
  order: number;
  title: string;
  phase?: string;
  time_window?: string;
  intervention_duration?: string;
  owner?: string;
  success_signal?: string;
  challenge_title?: string;
  method_name?: string;
  intervention: string;
  script_template: string;
}

export interface ExtendedPrintableContent {
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

export interface PlaybookPdfData {
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
  } | null;
}

// ── Logo ─────────────────────────────────────────────────────────────────

function getLogoDataUri(): string {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'metodic-logo.png');
    const buf = fs.readFileSync(logoPath);
    return `data:image/png;base64,${buf.toString('base64')}`;
  } catch {
    return 'https://metodic.io/metodic-logo.png';
  }
}

// ── Topic icons (SVG paths) ──────────────────────────────────────────────
// Matching Lucide-style 24×24 icons based on playbook category.

const TOPIC_ICONS: Record<string, string> = {
  // compass – general / leadership
  default:
    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm-1.5-5.5 5-2.5-2.5-5-5 2.5ZM12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z',
  // users – team / collaboration
  collaboration:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  // trending-up – strategy / performance
  strategy:
    'M22 7l-8.5 8.5-5-5L2 17M22 7h-6M22 7v6',
  // shield – trust / safety
  trust:
    'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
  // message-circle – communication / feedback
  communication:
    'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z',
  // lightbulb – innovation
  innovation:
    'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z',
  // target – decision-making / alignment
  'decision-making':
    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 16a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
  alignment:
    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 16a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
  // refresh-cw – change management
  'change management':
    'M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15',
  // activity – engagement / meetings
  meetings:
    'M22 12h-4l-3 9L9 3l-3 9H2',
  engagement:
    'M22 12h-4l-3 9L9 3l-3 9H2',
  // book-open – learning / onboarding
  learning:
    'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2ZM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z',
  onboarding:
    'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2ZM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z',
};

function pickIcon(category: string): string {
  const key = category.toLowerCase().trim();
  for (const [k, v] of Object.entries(TOPIC_ICONS)) {
    if (key.includes(k)) return v;
  }
  return TOPIC_ICONS.default;
}

// ── Palette (matching Metodic worksheet style) ───────────────────────────

const C = {
  ink: '#111827',       // gray-900
  heading: '#374151',   // gray-700 – section titles
  body: '#1a1a1a',      // primary text
  muted: '#6b7280',     // gray-500
  light: '#9ca3af',     // gray-400 (footer)
  border: '#d1d5db',    // gray-300
  borderLight: '#e5e7eb', // gray-200
  bg: '#f9fafb',        // gray-50
  white: '#ffffff',
  accent: '#374151',    // brand accent (Metodic default)
};

// ── Fonts ────────────────────────────────────────────────────────────────
// @react-pdf/renderer ships with the 14 standard PDF fonts built in.
// We use Helvetica (body) and Helvetica-Bold (headings) — these match the
// Metodic worksheet PDF style which falls back to Helvetica/Arial.

// ── Stylesheet ───────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Pages
  page: {
    paddingTop: 50,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.6,
    color: C.body,
    backgroundColor: C.white,
  },
  coverPage: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.body,
    backgroundColor: C.white,
  },

  // ── Cover ──
  coverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: C.border,
  },
  coverLogo: {
    width: 120,
    height: 40,
    objectFit: 'contain',
  },
  coverBadge: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: C.muted,
  },
  coverCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 60,
    paddingTop: 60,
  },
  coverIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },
  coverTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 30,
    color: C.ink,
    textAlign: 'center',
    lineHeight: 1.2,
    marginBottom: 12,
  },
  coverSubtitle: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 1.55,
    marginBottom: 28,
    maxWidth: 410,
  },
  coverChipRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  chip: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    fontSize: 8.5,
    color: C.heading,
    marginHorizontal: 4,
    marginBottom: 6,
  },
  coverInfo: {
    borderWidth: 1,
    borderColor: C.borderLight,
    borderRadius: 8,
    padding: 14,
    marginHorizontal: 40,
    marginBottom: 20,
    backgroundColor: C.bg,
  },
  coverInfoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  coverInfoLabel: {
    width: 120,
    fontWeight: 600,
    fontSize: 9.5,
    color: C.heading,
  },
  coverInfoValue: {
    flex: 1,
    fontSize: 9.5,
    color: C.body,
  },
  coverFooter: {
    position: 'absolute',
    bottom: 22,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.light,
  },

  // ── Content pages ──
  pageHeader: {
    position: 'absolute',
    top: 18,
    left: 40,
    right: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  pageHeaderLogo: {
    width: 70,
    height: 24,
    objectFit: 'contain',
  },
  pageHeaderLabel: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: C.light,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  pageFooter: {
    position: 'absolute',
    bottom: 18,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
    paddingTop: 6,
    fontSize: 9,
    color: C.light,
  },

  // ── Section elements ──
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
    color: C.heading,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: C.borderLight,
  },
  subHeading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: C.heading,
    marginTop: 8,
    marginBottom: 5,
  },
  paragraph: {
    marginBottom: 7,
  },
  instructionBox: {
    backgroundColor: C.bg,
    borderLeftWidth: 3,
    borderLeftColor: C.border,
    borderRadius: 4,
    padding: 12,
    marginBottom: 10,
  },
  card: {
    borderWidth: 2,
    borderColor: C.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  tipsBox: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.borderLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  twoCol: {
    flexDirection: 'row',
  },
  colLeft: {
    width: '49%',
    paddingRight: 8,
  },
  colRight: {
    width: '51%',
    paddingLeft: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bulletMark: {
    width: 14,
    color: C.accent,
    fontWeight: 600,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
    marginVertical: 8,
  },

  // ── Step meta strip ──
  metaStrip: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  metaItem: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  metaLabel: {
    fontSize: 7.5,
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 9,
    color: C.heading,
    marginTop: 1,
    fontWeight: 600,
  },

  // ── Final page CTA ──
  ctaBox: {
    borderWidth: 2,
    borderColor: C.border,
    borderRadius: 8,
    padding: 14,
    backgroundColor: C.bg,
    marginTop: 10,
  },

  // Sources
  sourceItem: {
    marginBottom: 5,
    fontSize: 9,
    color: C.muted,
  },
});

// ── Helpers ──────────────────────────────────────────────────────────────

function txt(value: string | null | undefined, fallback = ''): string {
  const clean = (value || '').replace(/\s+/g, ' ').trim();
  return clean || fallback;
}

function phaseOf(step: PlaybookStep, index: number): string {
  if (step.phase) return step.phase;
  if (index === 0) return 'Diagnose';
  if (index === 1) return 'Align';
  if (index === 2) return 'Pilot';
  return 'Embed';
}

function bullets(items: string[] | undefined, fallback: string[]) {
  const list = items && items.length > 0 ? items : fallback;
  return list.map((item, idx) => (
    <View style={s.bulletRow} key={`${item}-${idx}`}>
      <Text style={s.bulletMark}>•</Text>
      <Text style={s.bulletText}>{item}</Text>
    </View>
  ));
}

// ── Reusable page frame ──────────────────────────────────────────────────

function ContentPage({
  sectionLabel,
  logoUri,
  children,
}: {
  sectionLabel: string;
  logoUri: string;
  children: ReactNode;
}) {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.pageHeader} fixed>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={logoUri} style={s.pageHeaderLogo} />
        <Text style={s.pageHeaderLabel}>{sectionLabel}</Text>
      </View>
      {children}
      <View style={s.pageFooter} fixed>
        <Text>Made with Metodic</Text>
        <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </View>
    </Page>
  );
}

// ── Document ─────────────────────────────────────────────────────────────

function PlaybookPdfDocument({ playbook }: { playbook: PlaybookPdfData }) {
  const ext = playbook.extended_printable;
  const logoUri = getLogoDataUri();
  const iconPath = pickIcon(playbook.category);
  const generatedOn = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const title = txt(ext?.title, playbook.title);
  const subtitle = txt(ext?.subtitle, playbook.summary || playbook.organizational_challenge);

  return (
    <Document
      title={playbook.title}
      author="METODIC"
      subject="Extended intervention playbook"
      creator="METODIC learn"
      producer="METODIC learn"
    >
      {/* ─── 1. COVER ─── */}
      <Page size="A4" style={s.coverPage}>
        <View style={s.coverHeader}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={logoUri} style={s.coverLogo} />
          <Text style={s.coverBadge}>Extended Playbook</Text>
        </View>

        <View style={s.coverCenter}>
          <View style={s.coverIconWrap}>
            <Svg viewBox="0 0 24 24" width={32} height={32}>
              <Path d={iconPath} fill="none" stroke={C.heading} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>

          <Text style={s.coverTitle}>{title}</Text>
          <Text style={s.coverSubtitle}>{subtitle}</Text>

          <View style={s.coverChipRow}>
            <Text style={s.chip}>{playbook.category}</Text>
            <Text style={s.chip}>
              {txt(playbook.generated_from?.transformation_horizon, '6-10 weeks')}
            </Text>
            <Text style={s.chip}>
              {txt(playbook.generated_from?.cadence, 'weekly cadence')}
            </Text>
            <Text style={s.chip}>
              {txt(playbook.estimated_duration, '45-90 min per session')}
            </Text>
          </View>
        </View>

        <View style={s.coverInfo}>
          <View style={s.coverInfoRow}>
            <Text style={s.coverInfoLabel}>Audience</Text>
            <Text style={s.coverInfoValue}>
              {txt(playbook.target_audience, 'Leaders and facilitators')}
            </Text>
          </View>
          <View style={s.coverInfoRow}>
            <Text style={s.coverInfoLabel}>Interventions</Text>
            <Text style={s.coverInfoValue}>{playbook.sequence.length}</Text>
          </View>
          <View style={s.coverInfoRow}>
            <Text style={s.coverInfoLabel}>Review checkpoint</Text>
            <Text style={s.coverInfoValue}>
              {txt(playbook.generated_from?.review_checkpoint, 'Week 4')}
            </Text>
          </View>
          <View style={s.coverInfoRow}>
            <Text style={s.coverInfoLabel}>Generated</Text>
            <Text style={s.coverInfoValue}>{generatedOn}</Text>
          </View>
        </View>

        <Text style={s.coverFooter}>Made with Metodic</Text>
      </Page>

      {/* ─── 2. EXECUTIVE SUMMARY ─── */}
      <ContentPage sectionLabel="Overview" logoUri={logoUri}>
        <Text style={s.sectionTitle}>Executive Summary</Text>

        <View style={s.instructionBox}>
          <Text style={s.paragraph}>
            {txt(
              ext?.executive_summary,
              'This playbook provides a multi-phase transformation sequence. It combines concrete interventions, facilitation scripts, clear ownership, and success signals so teams can move from diagnosis to embedded behavior change.'
            )}
          </Text>
        </View>

        <View style={s.divider} />

        <View style={s.twoCol}>
          <View style={s.colLeft}>
            <Text style={s.subHeading}>Challenge Context</Text>
            <Text style={s.paragraph}>
              {txt(ext?.challenge_analysis?.context, playbook.organizational_challenge)}
            </Text>

            <Text style={s.subHeading}>Common Symptoms</Text>
            {bullets(ext?.challenge_analysis?.symptoms, [
              'Low alignment across teams',
              'Repeated decision loops',
              'Action follow-through gaps',
            ])}
          </View>

          <View style={s.colRight}>
            <Text style={s.subHeading}>Root Causes</Text>
            {bullets(ext?.challenge_analysis?.root_causes, [
              'Unclear decision rights',
              'Weak meeting structures',
              'Inconsistent accountability',
            ])}

            {ext?.challenge_analysis?.stakes && (
              <>
                <Text style={s.subHeading}>Why It Matters</Text>
                <Text style={s.paragraph}>{ext.challenge_analysis.stakes}</Text>
              </>
            )}
          </View>
        </View>
      </ContentPage>

      {/* ─── 3. DESIGN PRINCIPLES ─── */}
      <ContentPage sectionLabel="Foundations" logoUri={logoUri}>
        <Text style={s.sectionTitle}>Design Principles</Text>
        <Text style={s.paragraph}>
          Each principle below informs how the interventions are sequenced. They combine facilitation discipline with behavior-change mechanics.
        </Text>

        {(ext?.theory_foundations && ext.theory_foundations.length > 0
          ? ext.theory_foundations
          : [
              {
                concept: 'Sequence over single event',
                explanation:
                  'Change quality improves when interventions are staged and reinforced over time rather than attempted in a single workshop.',
                application: 'Build rhythm and checkpointing into every playbook.',
              },
              {
                concept: 'Role clarity',
                explanation:
                  'Named ownership prevents drift and ambiguity after each session.',
                application: 'Assign a responsible owner to every intervention step.',
              },
              {
                concept: 'Observable signals',
                explanation:
                  'Teams sustain change when progress is visible and measurable.',
                application: 'Define one success indicator per phase.',
              },
            ]
        ).map((item, idx) => (
          <View style={s.card} key={`${item.concept || 'f'}-${idx}`} wrap={false}>
            <Text style={s.subHeading}>{txt(item.concept, `Principle ${idx + 1}`)}</Text>
            <Text style={s.paragraph}>{txt(item.explanation)}</Text>
            {item.application && (
              <Text style={s.paragraph}>
                <Text style={{ fontWeight: 600 }}>Application: </Text>
                {item.application}
              </Text>
            )}
          </View>
        ))}
      </ContentPage>

      {/* ─── 4-N. INTERVENTION STEPS ─── */}
      {playbook.sequence.map((step, index) => {
        const detail = ext?.detailed_steps?.find((d) => d.step_order === step.order);
        return (
          <ContentPage
            key={`${step.order}-${step.title}`}
            sectionLabel={`Step ${index + 1} of ${playbook.sequence.length}`}
            logoUri={logoUri}
          >
            <Text style={s.sectionTitle}>
              {txt(detail?.objective, step.title)}
            </Text>

            <View style={s.metaStrip}>
              <View style={s.metaItem}>
                <Text style={s.metaLabel}>Phase</Text>
                <Text style={s.metaValue}>{phaseOf(step, index)}</Text>
              </View>
              <View style={s.metaItem}>
                <Text style={s.metaLabel}>Timing</Text>
                <Text style={s.metaValue}>{txt(step.time_window, `Week ${index + 1}`)}</Text>
              </View>
              <View style={s.metaItem}>
                <Text style={s.metaLabel}>Duration</Text>
                <Text style={s.metaValue}>
                  {txt(step.intervention_duration, playbook.estimated_duration || '45-90 min')}
                </Text>
              </View>
              <View style={s.metaItem}>
                <Text style={s.metaLabel}>Owner</Text>
                <Text style={s.metaValue}>{txt(step.owner, 'Session lead')}</Text>
              </View>
            </View>

            <View style={s.instructionBox} wrap={false}>
              <Text style={s.subHeading}>Intervention Goal</Text>
              <Text style={s.paragraph}>
                {txt(detail?.deep_explanation, step.intervention)}
              </Text>
            </View>

            <View style={s.card} wrap={false}>
              <Text style={s.subHeading}>Facilitator Script</Text>
              <Text style={s.paragraph}>
                {txt(detail?.facilitator_guidance, step.script_template)}
              </Text>
            </View>

            <View style={s.twoCol}>
              <View style={s.colLeft}>
                <Text style={s.subHeading}>Execution Guidance</Text>
                {detail?.practical_example ? (
                  <>
                    <Text style={s.paragraph}>
                      <Text style={{ fontWeight: 600 }}>Example: </Text>
                      {detail.practical_example}
                    </Text>
                    <Text style={s.paragraph}>
                      <Text style={{ fontWeight: 600 }}>Risks + mitigations: </Text>
                      {txt(detail.risks_and_mitigations, 'Track blockers immediately and assign one mitigation owner.')}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={s.paragraph}>
                      Prepare the objective and participants before the session.
                    </Text>
                    <Text style={s.paragraph}>
                      End with explicit owners, deadlines, and a checkpoint date.
                    </Text>
                  </>
                )}
              </View>
              <View style={s.colRight}>
                <Text style={s.subHeading}>Applied Context</Text>
                <Text style={s.paragraph}>
                  <Text style={{ fontWeight: 600 }}>Challenge: </Text>
                  {txt(step.challenge_title, 'Related challenge')}
                </Text>
                <Text style={s.paragraph}>
                  <Text style={{ fontWeight: 600 }}>Method: </Text>
                  {txt(step.method_name, 'Context-specific method')}
                </Text>
              </View>
            </View>

            <View style={s.tipsBox} wrap={false}>
              <Text style={s.subHeading}>Success Signal</Text>
              <Text style={s.paragraph}>
                {txt(
                  detail?.success_metrics,
                  step.success_signal || 'Observable progress in decision quality and follow-through.'
                )}
              </Text>
            </View>
          </ContentPage>
        );
      })}

      {/* ─── IMPLEMENTATION ROADMAP ─── */}
      <ContentPage sectionLabel="Implementation" logoUri={logoUri}>
        <Text style={s.sectionTitle}>90-Day Implementation Roadmap</Text>
        <Text style={s.paragraph}>
          Use this cadence to move from launch to durable practice.
        </Text>

        <View style={s.card} wrap={false}>
          <Text style={s.subHeading}>Days 1 – 30</Text>
          {bullets(ext?.implementation_roadmap?.first_30_days, [
            'Define the playbook owner and facilitation support roles.',
            'Schedule all interventions with a clear cadence.',
          ])}
        </View>

        <View style={s.card} wrap={false}>
          <Text style={s.subHeading}>Days 31 – 60</Text>
          {bullets(ext?.implementation_roadmap?.days_31_60, [
            'Track success signals per intervention and resolve blockers quickly.',
          ])}
        </View>

        <View style={s.card} wrap={false}>
          <Text style={s.subHeading}>Days 61 – 90</Text>
          {bullets(ext?.implementation_roadmap?.days_61_90, [
            'Run checkpoint review and adapt the next intervention cycle.',
          ])}
        </View>

        {ext?.implementation_roadmap?.governance_and_review && (
          <View style={s.tipsBox} wrap={false}>
            <Text style={s.subHeading}>Governance and Review</Text>
            <Text style={s.paragraph}>
              {ext.implementation_roadmap.governance_and_review}
            </Text>
          </View>
        )}
      </ContentPage>

      {/* ─── FINAL PAGE – CTA + SOURCES ─── */}
      <Page size="A4" style={s.page}>
        <View style={s.pageHeader} fixed>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={logoUri} style={s.pageHeaderLogo} />
          <Text style={s.pageHeaderLabel}>Next Steps</Text>
        </View>

        <Text style={s.sectionTitle}>Scale This with Metodic.io</Text>

        <View style={s.ctaBox} wrap={false}>
          <Text style={s.paragraph}>
            {txt(
              ext?.final_metodic_cta?.why_metodic,
              'Use Metodic.io to convert this playbook into practical session designs, facilitation assets, and repeatable intervention workflows — faster than starting from scratch.'
            )}
          </Text>
          <Text style={s.subHeading}>How Metodic helps</Text>
          {bullets(ext?.final_metodic_cta?.benefits, [
            'Design intervention sessions with proven structures and templates.',
            'Generate facilitator scripts and participant materials automatically.',
            'Standardize quality across teams, projects, and initiatives.',
          ])}
          <Text style={s.paragraph}>
            Explore: <Link src="https://metodic.io">https://metodic.io</Link>
          </Text>
        </View>

        {ext?.sources && ext.sources.length > 0 && (
          <>
            <View style={s.divider} />
            <Text style={s.subHeading}>Research Sources</Text>
            {ext.sources.slice(0, 20).map((source, idx) => (
              <Text
                key={`${source.url || source.title || 'source'}-${idx}`}
                style={s.sourceItem}
              >
                • {txt(source.title, source.publisher || 'Source')}:{' '}
                {txt(source.url, 'No URL provided')}
                {source.relevance_note ? ` — ${source.relevance_note}` : ''}
              </Text>
            ))}
          </>
        )}

        {/* Logo + footer on the final page */}
        <View
          style={{
            position: 'absolute',
            bottom: 50,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}
        >
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={logoUri} style={{ width: 90, height: 30, objectFit: 'contain', marginBottom: 6 }} />
          <Text style={{ fontSize: 9, color: C.light }}>Made with Metodic</Text>
        </View>

        <View style={s.pageFooter} fixed>
          <Text>Made with Metodic</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export async function renderPlaybookPdf(playbook: PlaybookPdfData): Promise<NodeJS.ReadableStream> {
  return pdf(<PlaybookPdfDocument playbook={playbook} />).toBuffer();
}
