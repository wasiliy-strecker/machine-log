import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { PhotoViewer } from './photo-viewer';
import { router } from 'expo-router';
import {
  Body,
  Button,
  Card,
  IconButton,
  useTheme,
} from '../../core/ui/components';
import { Icon } from '../../core/ui/icon';
import { Sortable } from '../../core/ui/sortable';
import { useServices } from '../../core/composition';
import { useFeedback, type MenuAnchor } from '../../core/ui/feedback';
import type { Attachment } from '../../core/domain/models';
type Source = 'camera' | 'gallery';
export type AttachmentActions = {
  busy: boolean;
  pick: (source: Source, replaceId?: string) => Promise<unknown>;
  remove: (id: string) => void;
  move: (id: string, delta: number) => void;
  reorder: (items: Attachment[]) => void;
};
function PhotoThumbnail(props: React.ComponentProps<typeof Image>) {
  const [failed, setFailed] = useState(false),
    c = useTheme();
  return failed ? (
    <View
      style={[
        props.style,
        { alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12 },
      ]}
    >
      <Icon name="error_outline" color={c.danger} />
      <Body>Foto nicht verfügbar</Body>
    </View>
  ) : (
    <Image {...props} onError={() => setFailed(true)} />
  );
}
export function PhotoGallery({
  photos,
  actions,
}: {
  photos: Attachment[];
  actions?: AttachmentActions;
}) {
  const { machine } = useServices();
  const feedback = useFeedback();
  const [gallery, setGallery] = useState<number | null>(null);
  async function menu(a: Attachment, index: number, anchor?: MenuAnchor) {
    const selected = await feedback.choose({
      title: `Foto ${index + 1} bearbeiten`,
      anchor,
      optionStyle: 'plain',
      options: [
        ...(photos.length > 1
          ? [
              {
                value: 'earlier',
                label: 'Nach vorne',
                disabled: index === 0,
              },
              {
                value: 'later',
                label: 'Nach hinten',
                disabled: index + 1 === photos.length,
              },
            ]
          : []),
        { value: 'replace', label: 'Foto ersetzen' },
        {
          value: 'remove',
          label: 'Foto entfernen',
        },
      ],
    });
    if (selected === 'earlier') actions?.move(a.id, -1);
    if (selected === 'later') actions?.move(a.id, 1);
    if (selected === 'remove') actions?.remove(a.id);
    if (selected === 'replace') {
      const source = await feedback.choose({
        title: 'Foto ersetzen',
        options: [
          {
            value: 'camera',
            label: 'Neu fotografieren',
            icon: 'photo_camera_outlined',
          },
          {
            value: 'gallery',
            label: 'Aus Galerie wählen',
            icon: 'photo_library_outlined',
          },
        ],
      });
      if (source) await actions?.pick(source as Source, a.id);
    }
  }
  function show(index: number) {
    setGallery(index);
  }
  return (
    <>
      {!photos.length ? (
        <Body>Keine aktuellen Fotos</Body>
      ) : (
        <Sortable
          items={photos}
          columns={photos.length === 1 ? 1 : 2}
          disabled={actions?.busy}
          onReorder={actions?.reorder}
          preview={(a) => (
            <PhotoThumbnail
              source={{ uri: machine.vault.uri(a.file) }}
              resizeMode="contain"
              style={{ width: '100%', aspectRatio: 4 / 3 }}
            />
          )}
          render={(a, index, canTap) => (
            <View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Foto ${index + 1} von ${photos.length} ansehen`}
                disabled={actions?.busy}
                onPress={() => {
                  if (canTap()) show(index);
                }}
              >
                <PhotoThumbnail
                  accessibilityLabel={`Foto ${index + 1}`}
                  source={{ uri: machine.vault.uri(a.file) }}
                  resizeMethod="resize"
                  resizeMode="contain"
                  style={{
                    aspectRatio: 4 / 3,
                    width: '100%',
                    borderRadius: 14,
                  }}
                />
              </Pressable>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  minHeight: 48,
                }}
              >
                <Body style={{ textAlign: 'center', flex: 1 }}>
                  Foto {index + 1}
                </Body>
                {actions && (
                  <IconButton
                    icon="more_vert"
                    menu
                    label={`Foto ${index + 1} bearbeiten`}
                    disabled={actions.busy}
                    onPress={(anchor) => void menu(a, index, anchor)}
                  />
                )}
              </View>
            </View>
          )}
        />
      )}
      {gallery !== null && (
        <PhotoViewer
          images={photos.map((a) => ({
            id: a.id,
            uri: machine.vault.uri(a.file),
          }))}
          initialIndex={gallery}
          close={() => setGallery(null)}
        />
      )}
    </>
  );
}
export function PhotoEditor({
  photos,
  actions,
}: {
  photos: Attachment[];
  actions: AttachmentActions;
}) {
  return (
    <Card style={{ margin: 4, padding: 13 }}>
      <Body strong>
        {photos.length > 1 ? 'Fotos aus dem Altbestand' : 'Foto (optional)'}
      </Body>
      {photos.length > 1 && (
        <Body muted>
          Diese Fotos bleiben erhalten. Ein neues Foto ersetzt das erste Foto.
        </Body>
      )}
      <PhotoGallery photos={photos} />
      <Button
        secondary
        icon="photo_camera_outlined"
        title={photos.length ? 'Neues Foto aufnehmen' : 'Zähler fotografieren'}
        disabled={actions.busy}
        onPress={() => void actions.pick('camera', photos[0]?.id)}
      />
      <Button
        secondary
        icon="photo_library_outlined"
        title="Foto aus Galerie"
        disabled={actions.busy}
        onPress={() => void actions.pick('gallery', photos[0]?.id)}
      />
      {photos.length === 1 && (
        <Button
          secondary
          icon="delete_outline"
          title="Foto entfernen"
          disabled={actions.busy}
          onPress={() => actions.remove(photos[0]!.id)}
        />
      )}
    </Card>
  );
}
export function Documents({ documents }: { documents: Attachment[] }) {
  const c = useTheme();
  if (!documents.length) return null;
  return (
    <Card style={{ margin: 4, padding: 13 }}>
      <Body strong>PDF-Anhänge aus dem Altbestand</Body>
      {documents.map((document) => (
        <Pressable
          key={document.id}
          accessibilityRole="button"
          accessibilityLabel={'PDF ' + document.name + ' öffnen'}
          onPress={() =>
            router.push({ pathname: '/pdf/[id]', params: { id: document.id } })
          }
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 8,
          }}
        >
          <Icon name="description_outlined" color={c.primary} />
          <View style={{ flex: 1, gap: 4 }}>
            <Body>{document.name}</Body>
            <Body muted>
              {document.pages} {document.pages === 1 ? 'Seite' : 'Seiten'}
            </Body>
          </View>
          <Icon name="chevron_right" />
        </Pressable>
      ))}
    </Card>
  );
}
