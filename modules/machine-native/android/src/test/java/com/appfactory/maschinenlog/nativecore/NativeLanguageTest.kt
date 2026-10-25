package com.appfactory.maschinenlog.nativecore

import android.app.Application
import android.app.NotificationManager
import android.os.Build
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [24, 35], application = Application::class, qualifiers = "fr-rFR")
class NativeLanguageTest {
    private val context get() = RuntimeEnvironment.getApplication()
    @Before fun allowNotifications() {
        shadowOf(context).grantPermissions("android.permission.POST_NOTIFICATIONS")
    }

    @Test fun selectionPersistsForBackgroundReceiversAndKeepsTheSystemRegion() {
        NativeLanguage.select(context, "en")
        assertEquals("en", NativeLanguage.preference(context))
        assertEquals("en", NativeLanguage.language(context))
        assertEquals("fr-FR", NativeLanguage.state(context)["formatLocale"])
        assertEquals("Production counter", NativeLanguage.text(context, R.string.ml_produktionszaehler))
        assertEquals("9007199254740993,15", NativeLanguage.number(context, "900719925474099315", 2, null))
        NativeLanguage.select(context, null)
        assertNull(NativeLanguage.preference(context))
        assertEquals("fr", NativeLanguage.language(context))
    }

    @Test fun unsupportedSystemLanguageFallsBackToEnglishAndAllCatalogsAreAvailable() {
        RuntimeEnvironment.setQualifiers("sv-rSE")
        NativeLanguage.select(context, null)
        assertEquals("en", NativeLanguage.language(context))
        assertEquals("sv-SE", NativeLanguage.state(context)["formatLocale"])
        val expected = mapOf("de" to "Produktionszähler", "en" to "Production counter",
            "es" to "Contador de producción", "fr" to "Compteur de production",
            "it" to "Contatore di produzione", "pt" to "Contador de produção")
        expected.forEach { (language, text) ->
            NativeLanguage.select(context, language)
            assertEquals(text, NativeLanguage.text(context, R.string.ml_produktionszaehler))
        }
    }

    @Test fun changingLanguageRefreshesActiveNotificationsWithoutMovingTheAlarm() {
        NativeLanguage.select(context, "de")
        val reminder = StoredReminder("counter-a", "My own machine", "machine", "Produktionszähler",
            "12,50", "Stück", "daily", 1, null, 9, 0, "normal", latestDigits = "1250", latestScale = 2)
        val due = System.currentTimeMillis() + 123456L
        ReminderStore.save(context, reminder, due, false)
        ReminderNotifier.showRecord(context, reminder, 42L)
        NativeLanguage.select(context, "en")
        val manager = context.getSystemService(NotificationManager::class.java)
        val notification = shadowOf(manager).allNotifications.single()
        assertTrue(notification.extras.getCharSequence("android.title").toString().contains("Production counter"))
        assertTrue(notification.extras.getCharSequence("android.title").toString().contains("My own machine"))
        assertTrue(notification.extras.getCharSequence("android.text").toString().contains("12,50"))
        assertEquals(due, ReminderStore.nextTrigger(context, reminder.recordId))
        assertEquals(42L, notification.`when`)
        if (Build.VERSION.SDK_INT >= 26) assertEquals("Normal reminder", manager.getNotificationChannel(notification.channelId).name.toString())
        val roundTrip = requireNotNull(StoredReminder.fromJson(reminder.toJson()))
        assertEquals("1250", roundTrip.latestDigits)
        assertEquals(2, roundTrip.latestScale)
        assertEquals("Stück", roundTrip.latestUnit)
    }
}
