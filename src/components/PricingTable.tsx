// ═══════════════════════════════════════════════════════════════════
// PRICING TABLE — one format, used for every age group.
//
// WHAT THE STAKEHOLDER REVIEW GOT STUCK ON, AND HOW THIS FIXES IT
//
//  1. Per-term and full-season prices sat in different places, so they
//     could not be compared. Here they are COLUMNS OF THE SAME ROW.
//  2. The pre-discount totals (485 / 670 / 500 / 685) were printed as
//     if they were prices, and read as a second, higher price list.
//     They now appear only inside "Save OMR 50 vs. paying term by
//     term" — as a saving, never as an amount anyone could pay.
//  3. Monthly looked like the cheap option because only the per-month
//     figure was shown. It is labelled "Monthly instalments", shows its
//     instalment count, and carries the note that paying by term or
//     season costs less.
//  4. Term dates were never stated. Every term heading carries its
//     weeks AND its dates.
//
// Every amount comes from src/data/pricing.ts through formatOMR().
// Nothing here hard-codes money.
//
// At 360px a five-column table cannot be read, so below `md` the same
// data renders as one card per frequency. The cell CONTENT is shared
// between both layouts (TermFigures / SeasonFigure), so the two views
// cannot drift apart.
// ═══════════════════════════════════════════════════════════════════

import { formatOMR, monthlyTotal, seasonSaving, termPrice, type PricingRow, type TermId } from '@/data/pricing';
import type { PriceBand, TermRow } from '@/data/content';
import { trainingDaysLabel } from '@/i18n/labels';
import { useLanguage } from '@/i18n/useLanguage';
import { useContent } from '@/i18n/useContent';

const thClass =
  'px-4 py-3 text-start font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[#C9A84C]';
const tdClass = 'px-4 py-4 font-inter text-[0.875rem] text-[#F5F1EB] align-top';

/** Upfront price for one term, with its monthly-instalment alternative. */
function TermFigures({ row, term }: { row: PricingRow; term: TermRow }) {
  const { t } = useLanguage();
  const id = term.id as TermId;
  const price = termPrice(row, id);

  return (
    <>
      <span className="block font-inter text-[1rem] font-semibold text-[#F5F1EB]">
        {formatOMR(price.upfront)}
      </span>
      <span className="block font-inter text-[0.6875rem] text-[#8A94A6] mt-[0.125rem]">
        {t('pricing.upfrontNote')}
      </span>
      <span className="mt-2 block font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-[#8A94A6]">
        {t('pricing.monthlyLabel')}
      </span>
      <span className="block font-inter text-[0.8125rem] text-[#C9A84C]">
        {t('pricing.monthlyEach', { amount: formatOMR(price.monthly) })}
      </span>
      <span className="block font-inter text-[0.6875rem] text-[#8A94A6]">
        {t('pricing.monthlyBreakdown', {
          count: term.instalments,
          total: formatOMR(monthlyTotal(row, id)),
        })}
      </span>
    </>
  );
}

/** Full-season price plus the saving, in money. */
function SeasonFigure({ row }: { row: PricingRow }) {
  const { t } = useLanguage();
  return (
    <>
      <span className="block font-bebas text-[1.875rem] leading-none tracking-[0.03em] text-[#E0C878]">
        {formatOMR(row.fullSeason)}
      </span>
      <span className="mt-2 block font-inter text-[0.75rem] font-semibold leading-[1.5] text-[#25D366]">
        {t('pricing.saveVsTerms', { amount: formatOMR(seasonSaving(row)) })}
      </span>
    </>
  );
}



export default function PricingTable({
  band,
  /** Rendered in the table's caption so each age group's table is self-describing. */
  caption,
}: {
  band: PriceBand;
  caption?: string;
}) {
  const { t } = useLanguage();
  const content = useContent();
  const terms = content.payableTerms;

  return (
    <div>
      {/* ── Desktop / tablet: the real table ───────────────────────── */}
      <div className="card-panel corner-ticks hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse">
          {caption && (
            <caption className="px-4 pt-4 text-start font-inter text-[0.8125rem] text-[#8A94A6]">
              {caption}
            </caption>
          )}
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.28)' }}>
              <th scope="col" className={thClass}>
                {t('pricing.frequencyHeader')}
              </th>
              {terms.map(term => (
                <th key={term.id} scope="col" className={thClass}>
                  <span className="block">
                    {term.term} <span className="font-normal normal-case">({term.duration})</span>
                  </span>
                  <span className="mt-1 block font-inter text-[0.6875rem] font-normal normal-case tracking-normal text-[#F5F1EB]">
                    {term.dates}
                  </span>
                  <span className="block font-inter text-[0.625rem] font-normal normal-case tracking-normal text-[#8A94A6]">
                    {t('pricing.instalmentsCount', { count: term.instalments })}
                  </span>
                </th>
              ))}
              <th
                scope="col"
                className={thClass}
                style={{ backgroundColor: 'rgba(201,168,76,0.07)' }}
              >
                <span className="block text-[#E0C878]">{t('pricing.fullSeasonHeader')}</span>
                <span className="mt-1 block font-inter text-[0.6875rem] font-normal normal-case tracking-normal text-[#F5F1EB]">
                  {t('pricing.fullSeasonSub')}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {band.rows.map((row, i) => (
              <tr
                key={row.frequency}
                style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(201,168,76,0.12)' }}
              >
                <th
                  scope="row"
                  className={`${tdClass} font-inter text-[0.9375rem] font-semibold text-[#C9A84C]`}
                >
                  {trainingDaysLabel(t, row.frequency)}
                </th>
                {terms.map(term => (
                  <td key={term.id} className={tdClass}>
                    <TermFigures row={row} term={term} />
                  </td>
                ))}
                <td className={tdClass} style={{ backgroundColor: 'rgba(201,168,76,0.07)' }}>
                  <SeasonFigure row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile: the same rows, stacked so nothing scrolls sideways ── */}
      <div className="flex flex-col gap-4 md:hidden">
        {caption && (
          <p className="font-inter text-[0.8125rem] leading-[1.6] text-[#8A94A6]">{caption}</p>
        )}
        {band.rows.map(row => (
          <div key={row.frequency} className="card-panel corner-ticks p-5">
            <h4 className="font-inter text-[0.9375rem] font-semibold text-[#C9A84C]">
              {trainingDaysLabel(t, row.frequency)}
            </h4>

            <dl className="mt-4 flex flex-col gap-4">
              {content.payableTerms.map(term => (
                <div key={term.id}>
                  <span className="hairline mb-3 block" aria-hidden="true" />
                  <dt className="font-inter text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[#C9A84C]">
                    {term.term}{' '}
                    <span className="font-normal normal-case tracking-normal text-[#8A94A6]">
                      ({term.duration})
                    </span>
                  </dt>
                  <dd className="mt-1">
                    <span className="block font-inter text-[0.75rem] text-[#F5F1EB]">
                      {term.dates}
                    </span>
                    <div className="mt-2">
                      <TermFigures row={row} term={term} />
                    </div>
                  </dd>
                </div>
              ))}

              {/* Full season sits in the same list, so it is still compared
                  against the terms rather than living somewhere else. */}
              <div
                className="rounded-[2px] p-4"
                style={{
                  backgroundColor: 'rgba(201,168,76,0.07)',
                  border: '1px solid rgba(201,168,76,0.22)',
                }}
              >
                <dt className="font-inter text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[#E0C878]">
                  {t('pricing.fullSeasonHeader')}
                </dt>
                <dd className="mt-1">
                  <span className="block font-inter text-[0.75rem] leading-[1.5] text-[#F5F1EB]">
                    {t('pricing.fullSeasonSub')}
                  </span>
                  <div className="mt-2">
                    <SeasonFigure row={row} />
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      {/* Why monthly is not the bargain it looks like. */}
      <p className="mt-4 font-inter text-[0.8125rem] leading-[1.7] text-[#8A94A6]">
        {content.monthlyWarning}
      </p>
    </div>
  );
}
