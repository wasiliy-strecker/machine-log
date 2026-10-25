import { t } from '../../core/localization/runtime';
import { useLocalization } from '../../core/localization/react';
// Adapted from ZählerstandLog and Flutter MaschinenLog (MPL-2.0).
import { Body, Card } from '../../core/ui/components';
export function CaptureGuidance() {
  useLocalization();
  return (
    <Card>
      <Body strong style={{ fontSize: 16 }}>
        {t('forGoodDetection')}
      </Body>
      <Body>
        {t('captureTheEntireDisplayAsStraightOnAsPossible')}
        {'\n'}
        {t('avoidReflectionsAndShadows')}
        {'\n'}
        {t('maschinenZaehlernummerNachMoeglichkeitMitfotografieren')}
      </Body>
      <Body muted>
        {t(
          'theSupportingPhotoIsReducedToAMaximumOf1920PixelsOnTheLongestEdgeForLocalStorageAndOptimizedAsA',
        )}
      </Body>
    </Card>
  );
}
