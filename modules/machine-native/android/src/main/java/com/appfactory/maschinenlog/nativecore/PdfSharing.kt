package com.appfactory.maschinenlog.nativecore

import android.content.ClipData
import android.content.Context
import android.content.Intent
import androidx.core.content.FileProvider

internal fun pdfShareIntent(context: Context, uris: List<String>): Intent {
    require(uris.size in 1..20) { NativeLanguage.text(context, R.string.ml_pdfpartcountinvalid) }
    val shared = ArrayList(uris.map { uri ->
        val file = privateDocument(context, uri)
        require(file.extension.equals("pdf", ignoreCase = true)) { NativeLanguage.text(context, R.string.ml_pdfpartsonly) }
        FileProvider.getUriForFile(context, context.packageName + ".machine.files", file)
    })
    val clips = ClipData.newUri(context.contentResolver, NativeLanguage.text(context, R.string.ml_produktionsprotokoll), shared.first())
    shared.drop(1).forEach { clips.addItem(ClipData.Item(it)) }
    val intent = Intent(Intent.ACTION_SEND_MULTIPLE).setType("application/pdf")
        .putParcelableArrayListExtra(Intent.EXTRA_STREAM, shared)
        .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    intent.clipData = clips
    return Intent.createChooser(intent, NativeLanguage.text(context, R.string.ml_shareallparts))
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION)
}
