// Wir klinken uns in die globale init-Funktion des Spiels ein.
// Diese wird erst aufgerufen, wenn ALLE Skripte vollständig geladen wurden!
if (typeof init !== "undefined")
{
    let original_init = init;
    init = function()
    {
        // 1. Lass das Spiel zuerst seine normale Initialisierung durchfuehren
        original_init();

        // 2. Da jetzt alles fertig geladen ist, existiert handleInputAfterGui garantiert!
        if (typeof handleInputAfterGui !== "undefined")
        {
            let original_handleInputAfterGui = handleInputAfterGui;
            handleInputAfterGui = function(ev)
            {
                if (ev.type === "keydown")
                {
                    // === DIAGNOSE-BLOCK: Zeigt uns die Eigenschaften von keysym ===
                    let keysymProps = [];
                    for (let p in ev.keysym)
                    {
                        try {
                            keysymProps.push(p + "=" + ev.keysym[p]);
                        } catch(e) {
                            keysymProps.push(p + "=error");
                        }
                    }
                    warn("[ACCESSIBLE-DEBUG] keysym: " + keysymProps.join(" | "));

                    // === DIREKT-ERKENNUNG ÜBER STANDARDISIERTE SDL2-CODES ===

                    // F11 gedrueckt (Physischer Scancode 68 oder Keycode 1073741892)
                    if (ev.keysym && (ev.keysym.scancode === 68 || ev.keysym.sym === 1073741892))
                    {
                        warn("[ACCESSIBLE-DEBUG] F11 erkannt! Alarm ausloesen...");
                        triggerAccessibleAlert(true);
                        return true; // Konsumiert die Taste fuer das Spiel
                    }

                    // F12 gedrueckt (Physischer Scancode 69 oder Keycode 1073741893)
                    if (ev.keysym && (ev.keysym.scancode === 69 || ev.keysym.sym === 1073741893))
                    {
                        warn("[ACCESSIBLE-DEBUG] F12 erkannt! Alarm beenden...");
                        triggerAccessibleAlert(false);
                        return true;
                    }
                }
                return original_handleInputAfterGui(ev);
            };
        }
    };
}

function triggerAccessibleAlert(raise)
{
    // 1. Sichere die aktuelle Auswahl des Spielers
    let originalSelection = g_Selection.toList();

    // 2. Finde alle eigenen Gebaeude mit der Eigenschaft "alertRaiser"
    let myEntities = Engine.GuiInterfaceCall("GetPlayerEntities", { "player": g_ViewedPlayer });
    let alertRaisers = [];
    if (myEntities && myEntities.entities)
    {
        for (let ent of myEntities.entities)
        {
            let state = GetEntityState(ent);
            if (state && state.alertRaiser)
                alertRaisers.push(ent);
        }
    }

    // 3. Wenn Gebaeude gefunden wurden, loese den Alarm aus oder beende ihn
    if (alertRaisers.length > 0)
    {
        g_Selection.reset();
        g_Selection.addList(alertRaisers);

        if (raise)
            raiseAlert();
        else
            endOfAlert();

        // 4. Stelle die urspruengliche Auswahl sofort wieder her
        g_Selection.reset();
        g_Selection.addList(originalSelection);
    }
}
