// =========================================================================
// AM ENDE DER DATEI HINZUFÜGEN: Freischaltung fuer die GUI (Proxy-Registrierung)
// =========================================================================

// 1. Registriere unsere Funktion als freigegeben
const accessibleAlert_exposedFunctions = {
    "AccessibleAlert_FindNearestResource": 1
};

// 2. Erstelle einen Proxy um ScriptCall, um unsere Funktion abzufangen und auszufuehren
GuiInterface.prototype.ScriptCall = new Proxy(GuiInterface.prototype.ScriptCall,
                                              {
                                                  apply(target, that, args) {
                                                      const [player, name, vargs] = args;
                                                      if (name in accessibleAlert_exposedFunctions)
                                                          return that[name](player, vargs);
                                                      return target.apply(that, args);
                                                  }
                                              });

// 3. Re-registriere die Komponente in der C++ Engine, damit die Aenderung aktiv wird
Engine.ReRegisterComponentType(IID_GuiInterface, "GuiInterface", GuiInterface);
