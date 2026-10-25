import { t, languages, languageNames } from '../../core/localization/runtime';
import { useLocalization } from '../../core/localization/react';
import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {
  SelectField,
  Body,
  Button,
  BusyOverlay,
  Card,
  Field,
  Heading,
  Notice,
  Page,
  useTheme,
} from '../../core/ui/components';
import { Icon } from '../../core/ui/icon';
import { DialogActions } from '../../core/ui/dialog-actions';
import { useSettings } from './use-settings';
function PasswordDialog({
  confirm,
  close,
}: {
  confirm: boolean;
  close: (value: string | null) => void;
}) {
  useLocalization();
  const c = useTheme();
  const [password, setPassword] = useState(''),
    [repeat, setRepeat] = useState(''),
    [show, setShow] = useState(false),
    [error, setError] = useState('');
  function submit() {
    Keyboard.dismiss();
    if (
      !password ||
      (confirm && password.length < 6) ||
      password.length > 1024
    ) {
      setError(
        confirm
          ? t('bitteEinPasswortMit6Bis1024ZeichenEingeben')
          : t('bitteEinGueltigesPasswortEingeben'),
      );
      return;
    }
    if (confirm && password !== repeat) {
      setError(t('thePasswordsDoNotMatch'));
      return;
    }
    close(password);
  }
  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => close(null)}
    >
      <KeyboardAvoidingView
        behavior="padding"
        style={{
          flex: 1,
          backgroundColor: '#00000066',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <View
          accessibilityViewIsModal
          style={{
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 28,
            padding: 24,
            gap: 16,
            maxHeight: '85%',
            maxWidth: 560,
            width: '100%',
            alignSelf: 'center',
          }}
        >
          <Text
            accessibilityRole="header"
            style={{
              fontFamily: 'Roboto',
              fontSize: 24,
              lineHeight: 32,
              color: c.ink,
            }}
          >
            {confirm ? t('setBackupPassword') : t('backupPasswortEingeben')}
          </Text>
          <ScrollView
            style={{ flexGrow: 0, flexShrink: 1 }}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 16, paddingTop: 8 }}
          >
            <Body>
              {confirm
                ? t(
                    'mindestens6ZeichenOhneDiesesPasswortKannDasBackupNichtWiederhergestelltWerden',
                  )
                : t('gibDasPasswortDieserMaschinenlogSicherungEin')}
            </Body>
            <Field
              label={t('password')}
              secureTextEntry={!show}
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setError('');
              }}
              onSubmitEditing={confirm ? undefined : submit}
              returnKeyType={confirm ? undefined : 'done'}
              trailing={
                show ? 'visibility_off_outlined' : 'visibility_outlined'
              }
              onTrailingPress={() => setShow((v) => !v)}
            />
            {confirm && (
              <Field
                label={t('repeatPassword')}
                secureTextEntry={!show}
                autoCapitalize="none"
                autoCorrect={false}
                value={repeat}
                onChangeText={(value) => {
                  setRepeat(value);
                  setError('');
                }}
                onSubmitEditing={submit}
                returnKeyType="done"
              />
            )}
          </ScrollView>
          <Notice error text={error} />
          <DialogActions
            actions={[
              { label: t('cancel'), onPress: () => close(null) },
              {
                label: t('next'),
                filled: true,
                onPress: submit,
              },
            ]}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
export function SettingsScreen() {
  const locale = useLocalization();
  const c = useTheme();
  const [prompt, setPrompt] = useState<{
    confirm: boolean;
    id: number;
  }>();
  const resolve = useRef<((value: string | null) => void) | null>(null);
  useEffect(() => () => resolve.current?.(null), []);
  const vm = useSettings(
    (confirm) =>
      new Promise((done) => {
        resolve.current = done;
        setPrompt({ confirm, id: Date.now() });
      }),
  );
  function close(value: string | null) {
    setPrompt(undefined);
    resolve.current?.(value);
    resolve.current = null;
  }
  return (
    <>
      <Page>
        <Notice error text={vm.error} />
        <Heading>{t('language')}</Heading>
        <Card>
          <SelectField
            label={t('language')}
            value={locale.preference ?? 'system'}
            disabled={vm.busy}
            options={[
              { value: 'system', label: t('systemLanguage') },
              ...languages.map((language) => ({
                value: language,
                label: languageNames[language],
              })),
            ]}
            onChange={(value) =>
              void vm.changeLanguage(
                value === 'system' ? null : (value as typeof locale.language),
              )
            }
          />
          <Body muted>{t('languageHelp')}</Body>
        </Card>
        <Heading>{t('backup')}</Heading>
        <Card style={{ padding: 0, gap: 0 }}>
          <Pressable
            accessibilityRole="button"
            disabled={vm.busy}
            onPress={() => void vm.create()}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: 'row',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <Icon name="lock_outline" />
            <View style={{ flex: 1, gap: 4 }}>
              <Body style={{ fontSize: 16 }}>{t('createEncryptedBackup')}</Body>
              <Body muted>{t('maschinenZaehlerKorrekturenFotosUndPdfs')}</Body>
            </View>
            <Icon name="chevron_right" />
          </Pressable>
          <View style={{ height: 1, backgroundColor: c.border }} />
          <Pressable
            accessibilityRole="button"
            disabled={vm.busy}
            onPress={() => void vm.restore()}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: 'row',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <Icon name="settings_backup_restore_outlined" />
            <View style={{ flex: 1, gap: 4 }}>
              <Body style={{ fontSize: 16 }}>{t('restoreBackup')}</Body>
              <Body muted>
                {t('korrekturhistorienWerdenVollstaendigGeprueft')}
              </Body>
            </View>
            <Icon name="chevron_right" />
          </Pressable>
        </Card>
        <View style={{ marginTop: 6 }}>
          <Heading>{t('privacy')}</Heading>
        </View>
        <Card style={{ padding: 18, gap: 0 }}>
          <Body>
            {t(
              'maschinendatenFotosZaehlerstaendeOcrUndPdfsWerdenLokalAufDeinemGeraetVerarbeitetDieAppUebertrae',
            )}
          </Body>
          <Body style={{ marginTop: 10 }}>
            {t(
              'yourDataRemainsStoredLocallyOnYourDeviceUntilYouDeleteItInTheAppOrRemoveTheAppData',
            )}
          </Body>
          <Body muted style={{ marginTop: 10 }}>
            {t('entwicklerUndDatenschutzkontakt')}
            {'\n'}
            Wasiliy Strecker · AppFabrik AI
          </Body>
          <View style={{ marginTop: 14 }}>
            <Button
              secondary
              icon="open_in_new"
              title={t('openPrivacyPolicy')}
              disabled={vm.busy}
              onPress={() => void vm.openPrivacy()}
            />
          </View>
        </Card>
        <View style={{ marginTop: 6 }}>
          <Heading>{t('uberMaschinenlog')}</Heading>
        </View>
        <Card style={{ padding: 0, gap: 0 }}>
          <View style={{ padding: 18, gap: 12 }}>
            <Body strong>{t('maschinenlog100')}</Body>
            <Body muted>{t('kostenlosOhneKontoOhneWerbung')}</Body>
            <Body muted>
              {t(
                'eigenstaendigeLokaleAndroidAppBackupsBis128MbFormularentwuerfeGehoerenNichtZumBackup',
              )}
            </Body>
          </View>
          <View style={{ height: 1, backgroundColor: c.border }} />
          <Pressable
            accessibilityRole="button"
            disabled={vm.busy}
            onPress={() => void vm.openSourceCode()}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: 'row',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <Icon name="code" />
            <View style={{ flex: 1, gap: 4 }}>
              <Body style={{ fontSize: 16 }}>{t('sourceCodeOnGithub')}</Body>
              <Body muted>{t('readmeUndProjektinformationen')}</Body>
            </View>
            <Icon name="open_in_new" />
          </Pressable>
        </Card>
      </Page>
      <BusyOverlay visible={!!vm.phase} label={vm.phase} />
      {prompt && (
        <PasswordDialog
          key={prompt.id}
          confirm={prompt.confirm}
          close={close}
        />
      )}
    </>
  );
}
