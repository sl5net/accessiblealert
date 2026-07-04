warn("[ACCESSIBLE-DEBUG] SIMULATION DATEI GELADEN!");

// Wir klinken uns in die globale init-Funktion des Spiels ein.
if (typeof init !== "undefined")
{
    let original_init = init;
    init = function()
    {
        original_init();

        if (typeof handleInputAfterGui !== "undefined")
        {
            let original_handleInputAfterGui = handleInputAfterGui;
            handleInputAfterGui = function(ev)
            {
                if (ev.type === "keydown" && ev.keysym)
                {
                    // Taste 'ö' gedrueckt (sym=246) -> Alarm ausloesen
                    // if (ev.keysym.sym === 246)
                    // {
//                         warn("[ACCESSIBLE-DEBUG] 'ö' erkannt! Alarm ausloesen...");
   //                      triggerAccessibleAlert(true);
      //                   return true; // Konsumiert die Taste fuer das Spiel
         //            }


                    // Taste 'ö' gedrueckt (sym=246) -> Automatisches Holz hacken fuer ausgewaehlte Arbeiter!
                    if (ev.keysym.sym === 246)
                    {
                        warn("[ACCESSIBLE-DEBUG] 'ö' erkannt! Suche naechstes Holzvorkommen...");

                        let selected = g_Selection.toList();
                        if (selected.length > 0)
                        {
                            // Rufe unsere neue Simulations-Suche auf
                            let nearestTree = Engine.GuiInterfaceCall("AccessibleAlert_FindNearestResource", {
                                "entities": selected,
                                "resourceType": "wood"
                            });

                            if (nearestTree)
                            {
                                warn("[ACCESSIBLE-DEBUG] Naechster Baum gefunden (ID: " + nearestTree + "). Sende Sammelbefehl!");
                                Engine.PostNetworkCommand({
                                    "type": "gather",
                                    "entities": selected,
                                    "target": nearestTree,
                                    "queued": false
                                });
                            }
                            else
                            {
                                warn("[ACCESSIBLE-DEBUG] Kein Holz im Umkreis von 150 Metern gefunden!");
                            }
                        }
                        else
                        {
                            warn("[ACCESSIBLE-DEBUG] Keine Arbeiter ausgewaehlt!");
                        }
                        return true;
                    }


                    // Taste 'l' gedrueckt (sym=108) -> Alarm beenden
                    if (ev.keysym.sym === 108)
                    {
                        warn("[ACCESSIBLE-DEBUG] 'l' erkannt! Alarm beenden...");
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

    // 2. Finde die Zivilisation des Spielers heraus (z.B. "athen", "roman"...)
    let civ = "";
    if (typeof g_Players !== "undefined" && g_Players[g_ViewedPlayer])
        civ = g_Players[g_ViewedPlayer].civ;
    else if (typeof g_SimState !== "undefined" && g_SimState.players && g_SimState.players[g_ViewedPlayer])
        civ = g_SimState.players[g_ViewedPlayer].civ;

    if (!civ)
    {
        warn("[ACCESSIBLE-DEBUG] Fehler: Zivilisation des Spielers konnte nicht ermittelt werden!");
        return;
    }

    // 3. Finde das Dorfzentrum dieser Zivilisation (Korrigierter Pfad mit / )
    //let civicCenterTemplate = "structures/" + civ + "/civic_center";
    // 3. Finde das Dorfzentrum dieser Zivilisation (Korrigierter Pfad mit / und "civil_centre" !)
    let civicCenterTemplate = "structures/" + civ + "/civil_centre";
    let alertRaisers = [];

    if (typeof Engine.PickSimilarPlayerEntities !== "undefined")
    {
        alertRaisers = Engine.PickSimilarPlayerEntities(
            civicCenterTemplate,
            true,  // includeOffscreen (sucht auf der ganzen Karte)
        true,  // requireExactTemplateMatch
        false  // includeFoundations
        );
    }

    warn("[ACCESSIBLE-DEBUG] Dorfzentren gefunden: " + alertRaisers.length);

    // 4. Wenn Dorfzentren gefunden wurden, loese den Alarm aus oder beende ihn
    if (alertRaisers.length > 0)
    {
        g_Selection.reset();
        g_Selection.addList(alertRaisers);

        if (raise)
            raiseAlert();
        else
            endOfAlert();

        // 5. Stelle die urspruengliche Auswahl sofort wieder her
        g_Selection.reset();
        g_Selection.addList(originalSelection);
    }
    else
    {
        warn("[ACCESSIBLE-DEBUG] Kein aktives Dorfzentrum unter dem Pfad '" + civicCenterTemplate + "' gefunden!");
    }
}
