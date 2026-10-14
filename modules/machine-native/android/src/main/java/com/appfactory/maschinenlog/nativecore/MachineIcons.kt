package com.appfactory.maschinenlog.nativecore

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import androidx.core.content.ContextCompat

internal object MachineIcons {
    fun drawableId(icon: String?): Int = when (icon) {
        "factory" -> R.drawable.ic_machine_factory
        "tools" -> R.drawable.ic_machine_tools
        "packaging" -> R.drawable.ic_machine_packaging
        "printer" -> R.drawable.ic_machine_printer
        "pump" -> R.drawable.ic_machine_pump
        "agriculture" -> R.drawable.ic_machine_agriculture
        "transport" -> R.drawable.ic_machine_transport
        else -> R.drawable.ic_machine_machine
    }

    fun bitmap(context: Context, icon: String?): Bitmap {
        val size = (64 * context.resources.displayMetrics.density).toInt().coerceAtLeast(64)
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val center = size / 2f
        canvas.drawCircle(center, center, center, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.rgb(0, 107, 99)
        })
        val inset = (size * 0.2f).toInt()
        requireNotNull(ContextCompat.getDrawable(context, drawableId(icon))).apply {
            setBounds(inset, inset, size - inset, size - inset)
            draw(canvas)
        }
        return bitmap
    }
}
