import {
  t,
  localization,
  setLocalization,
  type LanguagePreference,
} from '../../core/localization/runtime';
import { useState } from 'react';
import { useServices } from '../../core/composition';
import { useTask } from '../../core/ui/use-task';
import { useFeedback } from '../../core/ui/feedback';
import { useLeaveGuard } from '../../core/ui/use-leave-guard';
import { errorText } from '../../core/ui/components';
import type { PreparedBackup } from '../../core/media/media-service';
import type { BackupProgress } from '../../core/backup/backup-progress';
function progressLabel(progress: BackupProgress): string {
  const label = {
    preparing: t('backupWirdVorbereitet'),
    checking: t('dateienWerdenGeprueft'),
    encrypting: t('encryptingBackup'),
    decrypting: t('backupWirdEntschluesselt'),
    restoring: t('backupWirdWiederhergestellt'),
  }[progress.phase];
  return progress.totalFiles && progress.completedFiles !== undefined
    ? t('valueValueVonValue', {
        p0: label,
        p1: progress.completedFiles,
        p2: progress.totalFiles,
      })
    : `${label} …`;
}
export function useSettings(
  askPassword: (confirm: boolean) => Promise<string | null>,
) {
  const { backup, media, refresh, links, native } = useServices();
  const task = useTask(),
    feedback = useFeedback();
  const [phase, setPhase] = useState('');
  const onProgress = (progress: BackupProgress) =>
    setPhase(progressLabel(progress));
  useLeaveGuard({ dirty: false, busy: task.busy, discard: async () => {} });
  const openExternal = (url: string, failureMessage: string) =>
    task.run(async () => {
      try {
        await links.open(url);
      } catch {
        throw new Error(failureMessage);
      }
    });
  return {
    ...task,
    phase,
    changeLanguage: (language: LanguagePreference) =>
      task.run(async () => {
        setLocalization(await native.setLanguage(language));
      }),
    openPrivacy: () =>
      openExternal(
        localization().language === 'de'
          ? 'https://wasiliy-strecker.github.io/machine-log/datenschutz/'
          : 'https://wasiliy-strecker.github.io/machine-log/privacy/',
        t('thePrivacyPolicyCouldNotBeOpenedPleaseTryAgain'),
      ),
    openSourceCode: () =>
      openExternal(
        'https://github.com/wasiliy-strecker/machine-log#readme',
        t('theSourceCodeCouldNotBeOpenedPleaseTryAgain'),
      ),
    create: () =>
      task.run(async () => {
        const password = await askPassword(true);
        if (password === null) return;
        let prepared: PreparedBackup | undefined;
        try {
          setPhase(t('backupWirdVorbereitet111'));
          const bytes = await backup.create(password, onProgress);
          setPhase(t('speicherortWirdVorbereitet'));
          await new Promise<void>((resolve) => setTimeout(resolve, 0));
          prepared = await media.prepareBackup(bytes);
          setPhase('');
          let finished = false;
          while (!finished) {
            let saved = false;
            let failure = '';
            try {
              saved = (await media.saveBackup(prepared)) === 'saved';
            } catch (e) {
              failure = errorText(e);
            }
            if (saved) {
              const action = await feedback.choose({
                title: t('backupSaved'),
                message: t(
                  'valueWurdeImGewaehltenSpeicherortAbgelegtBewahreDieDateiUndDeinPasswortSicherAuf',
                  { p0: prepared.name },
                ),
                dialog: true,
                stackedActions: true,
                options: [
                  {
                    value: 'done',
                    label: t('done'),
                    filled: true,
                    icon: 'check',
                  },
                  {
                    value: 'share',
                    label: t('share'),
                    icon: 'ios_share_outlined',
                    outlined: true,
                  },
                ],
              });
              if (action === 'share') await media.shareBackup(prepared);
              finished = true;
            } else {
              const action = await feedback.choose({
                title: t('backupNotSavedYet'),
                message:
                  failure ||
                  t(
                    'dieSpeicherortauswahlWurdeAbgebrochenDuKannstErneutEinenSpeicherortWaehlen',
                  ),
                dialog: true,
                stackedActions: true,
                options: [
                  {
                    value: 'discard',
                    label: t('discardBackup'),
                    danger: true,
                    filled: true,
                    icon: 'delete_outline',
                  },
                  {
                    value: 'retry',
                    label: t('selectStorageLocation'),
                    outlined: true,
                    icon: 'folder_open_outlined',
                  },
                ],
              });
              finished = action !== 'retry';
            }
          }
        } finally {
          setPhase('');
          if (prepared) await media.discardBackup(prepared).catch(() => {});
        }
      }),
    restore: () =>
      task.run(async () => {
        const bytes = await media.pickBackup();
        if (!bytes) return;
        const password = await askPassword(false);
        if (password === null) return;
        try {
          setPhase(t('backupIsBeingChecked'));
          const decoded = await backup.codec.decode(
            bytes,
            password,
            onProgress,
          );
          setPhase('');
          if (
            !(await feedback.confirm(
              t('restoreBackup106'),
              t(
                'valueMaschinenValueEintraegeUndValueProduktionsprotokolleWerdenImportiertNeuereLokaleEintraegeW',
                {
                  p0: decoded.data.records.length,
                  p1: decoded.data.entries.length,
                  p2: decoded.data.reports.length,
                },
              ),
              t('restore'),
              false,
            ))
          )
            return;
          setPhase(t('backupIsBeingRestored'));
          const result = await backup.restore(decoded, onProgress);
          refresh();
          feedback.notify(
            [
              t(
                'backupWiederhergestelltDieDatenSindSofortInDeinenMaschinenSichtbar',
              ),
              ...result.warnings,
            ].join('\n'),
          );
        } finally {
          setPhase('');
        }
      }),
  };
}
