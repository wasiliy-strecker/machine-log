package com.appfactory.maschinenlog.nativecore

import android.content.Intent
import android.content.ComponentCallbacks
import android.content.res.Configuration
import android.graphics.Bitmap
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import android.os.ParcelFileDescriptor
import androidx.core.content.FileProvider
import expo.modules.kotlin.Promise
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONArray
import java.io.File
import java.util.UUID

class MachineNativeModule : Module() {
    private var previews: PdfPreviewStore? = null
    @Synchronized private fun previewStore(): PdfPreviewStore = previews ?: PdfPreviewStore(context).also { previews = it }
    private val context get() = requireNotNull(appContext.reactContext)
    private val configurationCallback = object : ComponentCallbacks {
        override fun onConfigurationChanged(config: Configuration) {
            NativeLanguage.refreshNotifications(context)
            sendEvent("localizationChanged", NativeLanguage.state(context))
        }
        override fun onLowMemory() = Unit
    }
    override fun definition() = ModuleDefinition {
        Name("MachineNative")
        Events("localizationChanged")
        Function("getLocalization") { NativeLanguage.state(context) }
        AsyncFunction("setLanguage") { language: String? ->
            NativeLanguage.select(context, language)
            val state = NativeLanguage.state(context)
            sendEvent("localizationChanged", state)
            state
        }.runOnQueue(Queues.MAIN)
        OnCreate { context.registerComponentCallbacks(configurationCallback) }

        AsyncFunction("recognizeText") { uri: String, promise: expo.modules.kotlin.Promise -> recognizeCounter(context, uri, promise) }
        View(MachinePdfView::class) {
            Prop("session") { view: MachinePdfView, id: String -> view.open(previewStore(), id) }
        }
        AsyncFunction("openPdfPreview") { uri: String -> previewStore().open(uri) }
        AsyncFunction("renderPdfPage") { session: String, index: Int, width: Int -> previewStore().render(session, index, width) }
        AsyncFunction("closePdfPreview") { session: String -> previewStore().close(session) }
        AsyncFunction("sharePdfs") { uris: List<String> ->
            context.startActivity(pdfShareIntent(context, uris))
        }.runOnQueue(Queues.MAIN)
        AsyncFunction("printPdf") { uri: String, name: String ->
            val file = privateDocument(context, uri)
            val activity = requireNotNull(appContext.currentActivity)
            val manager = activity.getSystemService(android.content.Context.PRINT_SERVICE) as android.print.PrintManager
            manager.print(name, OriginalPdfPrintAdapter(context, file, name), null)
            Unit
        }.runOnQueue(Queues.MAIN)
        AsyncFunction("saveBackupFile") { uri: String, name: String, promise: Promise ->
            try {
                val file = privateDocument(context, uri)
                val token = UUID.randomUUID().toString()
                if (!SaveDocumentActivity.begin(token, SaveDocumentActivity.Pending(file, name, promise))) {
                    promise.reject("SAVE_BUSY", NativeLanguage.text(context, R.string.ml_savebusy), null)
                } else {
                    try { requireNotNull(appContext.currentActivity).startActivity(Intent(context, SaveDocumentActivity::class.java).putExtra("save_token", token)) }
                    catch (_: Exception) { SaveDocumentActivity.finish(token, false, NativeLanguage.text(context, R.string.ml_savepickerfailed)) }
                }
            } catch (_: Exception) { promise.reject("SAVE_SOURCE", NativeLanguage.text(context, R.string.ml_savesourcemissing), null) }
        }.runOnQueue(Queues.MAIN)
        AsyncFunction("deriveBackupKey") { password: String, salt: String, iterations: Int ->
            PasswordKey.derive(password, salt, iterations)
        }
        OnDestroy { previews?.closeAll(); context.unregisterComponentCallbacks(configurationCallback) }
        AsyncFunction("validatePdf") { uri: String ->
            val file = File(requireNotNull(Uri.parse(uri).path))
            ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY).use { descriptor ->
                PdfRenderer(descriptor).use { renderer ->
                    require(renderer.pageCount in 1..2000) { NativeLanguage.text(context, R.string.ml_pdfemptyortoolong) }
                    for (index in 0 until renderer.pageCount) {
                        renderer.openPage(index).use { page ->
                            val bitmap = Bitmap.createBitmap(32, 32, Bitmap.Config.ARGB_8888)
                            try { page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY) }
                            finally { bitmap.recycle() }
                        }
                    }
                    renderer.pageCount
                }
            }
        }
        AsyncFunction("openPdf") { uri: String ->
            val file = File(requireNotNull(Uri.parse(uri).path))
            val shared = FileProvider.getUriForFile(context, context.packageName + ".machine.files", file)
            val intent = Intent(Intent.ACTION_VIEW).setDataAndType(shared, "application/pdf")
                .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
        }.runOnQueue(Queues.MAIN)
        AsyncFunction("syncReminders") { json: String ->
            val desired = JSONArray(json)
            val ids = mutableSetOf<String>()
            val warnings = mutableListOf<String>()
            for (index in 0 until desired.length()) {
                val reminder = requireNotNull(StoredReminder.fromJson(desired.getJSONObject(index).toString()))
                ids.add(reminder.recordId)
                if (!ReminderScheduler.update(context, reminder)) {
                    warnings.add(NativeLanguage.text(context, R.string.ml_reminderschedulefailed, reminder.label))
                } else if (!ReminderNotifier.refreshActive(context, reminder)) {
                    warnings.add(NativeLanguage.text(context, R.string.ml_reminderrefreshfailed, reminder.label))
                }
                if (ReminderNotifier.availability(context, reminder.isPunctual) != ReminderAvailability.AVAILABLE) warnings.add(NativeLanguage.text(context, R.string.ml_reminderpermissionmissing, reminder.label))
                if (reminder.isPunctual && !ReminderScheduler.canScheduleExact(context)) warnings.add(NativeLanguage.text(context, R.string.ml_exactpermissionmissing, reminder.label))
            }
            ReminderStore.statusIds(context).filter { !ids.contains(it) }.forEach {
                if (!ReminderScheduler.cancel(context, it)) warnings.add(NativeLanguage.text(context, R.string.ml_oldremindercancelfailed))
            }
            warnings
        }
        AsyncFunction("reminderStatus") {
            mapOf("notifications" to ReminderNotifier.notificationsEnabled(context),
                "exact" to ReminderScheduler.canScheduleExact(context),
                "doNotDisturb" to ReminderNotifier.doNotDisturbEnabled(context),
                "availability" to mapOf("normal" to ReminderNotifier.availability(context, false).wireValue,
                    "punctualWithSound" to ReminderNotifier.availability(context, true).wireValue),
                "schedules" to ReminderStore.statusIds(context).map { ReminderScheduler.status(context, it) })
        }
        AsyncFunction("acknowledge") { id: String -> ReminderNotifier.acknowledge(context, id) }
        AsyncFunction("testReminder") { request: Map<String, String?> ->
            val mode = requireNotNull(request["deliveryMode"])
            require(mode == "normal" || mode == "punctualWithSound")
            ReminderNotifier.showTest(context, request["counterId"], request["label"].orEmpty(), "machine", NativeLanguage.text(context, R.string.ml_produktionszaehler), request["latestValue"], request["latestUnit"], mode == "punctualWithSound", request["icon"])
        }
        AsyncFunction("openReminderSettings") { target: String, mode: String? ->
            openReminderSettings(context, target, mode)
        }.runOnQueue(Queues.MAIN)
        OnActivityEntersForeground {
            NativeLanguage.restore(context)
            ReminderScheduler.rescheduleAll(context)
            NativeLanguage.refreshNotifications(context)
            sendEvent("localizationChanged", NativeLanguage.state(context))
        }
    }
}
