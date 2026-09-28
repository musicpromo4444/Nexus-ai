package ai.nexus.assistant

import android.Manifest
import android.app.Activity
import android.os.Bundle
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : Activity() {
    private val requestCode = 4101
    override fun onCreate(savedInstanceState: Bundle?) { super.onCreate(savedInstanceState); requestCorePermissions() }
    private fun requestCorePermissions() {
        val wanted = arrayOf(Manifest.permission.RECORD_AUDIO, Manifest.permission.POST_NOTIFICATIONS, Manifest.permission.READ_CONTACTS)
        val missing = wanted.filter { ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED }
        if (missing.isNotEmpty()) ActivityCompat.requestPermissions(this, missing.toTypedArray(), requestCode)
    }
}
