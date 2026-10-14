import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useIsFocused } from 'expo-router/react-navigation';
import { useStartupHold } from '../../core/startup/startup';
import { useServices } from '../../core/composition';
import type { SavedReport } from '../../core/domain/models';
import { errorText } from '../../core/ui/components';
import { useTask } from '../../core/ui/use-task';
import { useFeedback } from '../../core/ui/feedback';

export function useReports(
  recordId: string,
  entryId: string | null,
  hasAttachments: boolean,
  counterId: string | null = null,
) {
  const focused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const { machine, revision, refresh } = useServices();
  const feedback = useFeedback();
  const task = useTask();
  const [reports, setReports] = useState<SavedReport[]>([]),
    [total, setTotal] = useState(0),
    [offset, setOffset] = useState(0),
    [loadedOffset, setLoadedOffset] = useState<number | null>(null),
    [expanded, setExpanded] = useState(false),
    [availableFiles, setAvailableFiles] = useState<Set<string> | null>(null),
    [loadError, setLoadError] = useState(''),
    [attempt, setAttempt] = useState(0),
    [deletingId, setDeletingId] = useState<string>();
  const pageLoading = loading || (!loadError && loadedOffset !== offset);
  useStartupHold(focused && pageLoading);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setLoadError('');
      setAvailableFiles(null);
      Promise.all([
        machine.repository.reportPage({ recordId, entryId, counterId, offset }),
        entryId || expanded ? machine.vault.list() : Promise.resolve(null),
      ])
        .then(([page, files]) => {
          if (active) {
            setReports(page.rows);
            setTotal(page.total);
            setLoadedOffset(page.offset);
            setAvailableFiles(files ? new Set(files) : null);
            if (page.offset !== offset) setOffset(page.offset);
          }
        })
        .catch((e) => {
          if (active) setLoadError(errorText(e));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
      // Revision/retry tokens intentionally reload persisted data on focus.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      machine,
      recordId,
      entryId,
      counterId,
      offset,
      revision,
      expanded,
      attempt,
    ]),
  );
  return {
    ...task,
    loading: pageLoading,
    loadError,
    expanded,
    setExpanded,
    availableFiles,
    deletingId,
    retry: () => setAttempt((n) => n + 1),
    reports,
    total,
    offset,
    setOffset,
    create: async () => {
      try {
        const selectedCounterId = counterId;
        const anyAttachments =
          !selectedCounterId && !entryId
            ? (await machine.repository.entries(recordId, '', 0, 1))
                .hasAttachments
            : hasAttachments;
        const mode = await feedback.choose({
          title: 'PDF-Inhalt wählen',
          message: 'Wähle, welche Inhalte deine PDF enthalten soll.',
          optionStyle: 'cards',
          options: [
            {
              value: 'compact',
              label: 'Kompakt ohne Anhänge',
              description:
                'Stände, Zuwächse, Wechsel, Korrekturen und Notizen mit Dokumentenliste.',
              icon: 'description_outlined',
            },
            {
              value: 'full',
              label: 'Mit Fotos',
              description: anyAttachments
                ? entryId
                  ? 'Enthält das aktuelle Foto und frühere Fotoversionen. Vorhandene Altanhänge bleiben enthalten.'
                  : 'Enthält aktuelle und frühere Fotos der Ablesungen. Vorhandene Altanhänge bleiben enthalten.'
                : 'Keine Fotos vorhanden.',
              icon: 'photo_outlined',
              disabled: !anyAttachments,
            },
          ],
        });
        if (mode === null) return;
        await task.run(async () => {
          const report = await machine.createReport(
            recordId,
            entryId,
            mode === 'full',
            selectedCounterId,
          );
          refresh();
          setOffset(0);
          router.push({ pathname: '/pdf/[id]', params: { id: report.id } });
        });
      } catch (error) {
        task.setError(errorText(error));
      }
    },
    open: (report: SavedReport) =>
      router.push({ pathname: '/pdf/[id]', params: { id: report.id } }),
    remove: async (report: SavedReport) => {
      if (
        await feedback.confirm(
          report.entryId
            ? 'Einzelprotokoll löschen?'
            : 'Zählerverlaufsprotokoll löschen?',
          'Die gespeicherte PDF wird entfernt. Bereits exportierte Kopien bleiben erhalten.',
        )
      )
        await task.run(async () => {
          setDeletingId(report.id);
          try {
            await machine.delete('report', report.id);
            refresh();
            feedback.notify(
              report.entryId
                ? 'Einzelprotokoll gelöscht.'
                : 'Zählerverlaufsprotokoll gelöscht.',
            );
          } finally {
            setDeletingId(undefined);
          }
        });
    },
  };
}
