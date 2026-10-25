package com.appfactory.maschinenlog.nativecore

import android.content.Context
import android.net.Uri
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import expo.modules.kotlin.Promise
import java.io.File

internal fun localOcrFile(context: Context, uri: String): File {
    val parsed = Uri.parse(uri)
    require(parsed.scheme == "file") { NativeLanguage.text(context, R.string.ml_ocrlocalphoto) }
    val file = File(requireNotNull(parsed.path)).canonicalFile
    require(listOf(context.filesDir, context.cacheDir).any {
        file.path.startsWith(it.canonicalPath + File.separator)
    }) { NativeLanguage.text(context, R.string.ml_photooutsidevault) }
    require(file.isFile && file.length() in 1..(50L * 1024 * 1024)) { NativeLanguage.text(context, R.string.ml_photomissinglarge) }
    return file
}

internal fun recognizeCounter(context: Context, uri: String, promise: Promise) {
    val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
    try {
        val file = localOcrFile(context, uri)
        val image = InputImage.fromFilePath(context, Uri.fromFile(file))
        recognizer.process(image)
            .addOnSuccessListener { text ->
                try {
                    val lines = text.textBlocks.flatMap { it.lines }.map { line ->
                        mapOf(
                            "text" to line.text,
                            "confidence" to line.confidence?.toDouble(),
                            "height" to (line.boundingBox?.height() ?: 0).toDouble(),
                            "elements" to line.elements.map { element ->
                                val bounds = element.boundingBox
                                mapOf("text" to element.text,
                                    "left" to (bounds?.left ?: 0).toDouble(),
                                    "top" to (bounds?.top ?: 0).toDouble(),
                                    "right" to (bounds?.right ?: 0).toDouble(),
                                    "bottom" to (bounds?.bottom ?: 0).toDouble())
                            }
                        )
                    }
                    promise.resolve(mapOf("rawText" to text.text, "lines" to lines))
                } catch (error: Exception) {
                    promise.reject("OCR_FAILED", NativeLanguage.text(context, R.string.ml_ocrunreadable), error)
                } finally { recognizer.close() }
            }
            .addOnFailureListener { error ->
                recognizer.close()
                promise.reject("OCR_FAILED", NativeLanguage.text(context, R.string.ml_ocrunreadable), error)
            }
    } catch (error: Exception) {
        recognizer.close()
        promise.reject("OCR_FAILED", NativeLanguage.text(context, R.string.ml_ocrfailed), error)
    }
}
