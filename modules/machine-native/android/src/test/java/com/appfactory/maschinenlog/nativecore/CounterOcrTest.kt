package com.appfactory.maschinenlog.nativecore

import android.content.Context
import android.app.Application
import org.robolectric.RuntimeEnvironment
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import java.io.File

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [35], application = Application::class)
class CounterOcrTest {
    private val context: Context = RuntimeEnvironment.getApplication()

    @Test fun acceptsOnlyExistingPrivateImagesAndRejectsTraversal() {
        val file = File(context.filesDir, "ocr-test.jpg")
        file.writeBytes(byteArrayOf(1, 2, 3))
        try {
            assertEquals(file.canonicalFile, localOcrFile(context, file.toURI().toString()))
            assertThrows(IllegalArgumentException::class.java) { localOcrFile(context, "https://example.com/photo.jpg") }
            assertThrows(IllegalArgumentException::class.java) { localOcrFile(context, "file:///sdcard/photo.jpg") }
            assertThrows(IllegalArgumentException::class.java) { localOcrFile(context, "file://${context.filesDir}/../outside.jpg") }
            assertThrows(IllegalArgumentException::class.java) { localOcrFile(context, "file://${context.filesDir}/missing.jpg") }
        } finally { file.delete() }
    }
}
