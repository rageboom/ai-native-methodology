import android.content.Context;
import android.content.SharedPreferences;

public class SharedPrefsTest {

    // ruleid: internal.mobile.security.android-insecure-shared-prefs
    SharedPreferences bad1 = context.getSharedPreferences("myPrefs", MODE_WORLD_READABLE);

    // ruleid: internal.mobile.security.android-insecure-shared-prefs
    SharedPreferences bad2 = context.getSharedPreferences("myPrefs", MODE_WORLD_WRITEABLE);

    // ruleid: internal.mobile.security.android-insecure-shared-prefs
    SharedPreferences bad3 = context.getSharedPreferences("myPrefs", Context.MODE_WORLD_READABLE);

    // ruleid: internal.mobile.security.android-insecure-shared-prefs
    SharedPreferences bad4 = context.getSharedPreferences("myPrefs", Context.MODE_WORLD_WRITEABLE);

    // ruleid: internal.mobile.security.android-insecure-shared-prefs
    SharedPreferences bad5 = getPreferences(MODE_WORLD_READABLE);

    // ruleid: internal.mobile.security.android-insecure-shared-prefs
    SharedPreferences bad6 = getPreferences(Context.MODE_WORLD_WRITEABLE);

    // ok: internal.mobile.security.android-insecure-shared-prefs
    SharedPreferences good1 = context.getSharedPreferences("myPrefs", Context.MODE_PRIVATE);

    // ok: internal.mobile.security.android-insecure-shared-prefs
    SharedPreferences good2 = getPreferences(MODE_PRIVATE);
}
