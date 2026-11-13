// --- CONFIGURACIÓN MODO SILENCIOSO Y EFICIENCIA ---
app.displayDialogs = DialogModes.NO;

// --- RUTAS DE TRABAJO ---
var origenDir = new Folder("C:/DataSet/conFondo");
var destinoDir = new Folder("C:/DataSet/sinFondo");

// Crear directorio de destino si no existe
if (!destinoDir.exists) {
    destinoDir.create();
}

// Crear subcarpetas para clasificación
var carpetaHoriz = new Folder(destinoDir.fsName + "\\Horizontales");
var carpetaVert = new Folder(destinoDir.fsName + "\\Verticales");

if (!carpetaHoriz.exists) carpetaHoriz.create();
if (!carpetaVert.exists) carpetaVert.create();

// Escaneamos todas las fotos de la carpeta
var archivos = origenDir.getFiles(/\.(jpg|jpeg|png|webp)$/i);
var totalProcesados = 0;
var errores = 0;

for (var i = 0; i < archivos.length; i++) {
    var archivoActual = archivos[i];

    // Formateamos el nombre de salida
    var nombreLimpio = archivoActual.name.substring(0, archivoActual.name.lastIndexOf("."));

    // Determinar orientación
    var docPreview = app.open(archivoActual);
    var esHorizontal = docPreview.width >= docPreview.height;
    docPreview.close(SaveOptions.DONOTSAVECHANGES);

    // Definir ruta según orientación
    var rutaBase = esHorizontal ? carpetaHoriz.fsName : carpetaVert.fsName;
    var rutaFinalWin = rutaBase + "\\" + nombreLimpio + ".png";
    var archivoDestino = new File(rutaFinalWin);

    // Si ya existe procesado, saltamos
    if (archivoDestino.exists) continue;

    try {
        // 1. Abrir la imagen original
        var doc = app.open(archivoActual);

        // 2. Forzar modo RGB nativo
        if (doc.mode != DocumentMode.RGB) {
            doc.changeMode(ChangeMode.RGB);
        }

        // 3. Desbloqueo de transparencia
        var capaOriginal = doc.activeLayer;
        var nuevaCapa = capaOriginal.duplicate();
        nuevaCapa.name = "Lienzo Transparente";

        try {
            doc.backgroundLayer.remove();
        } catch(e) {
            capaOriginal.remove();
        }

        // 4. Selección de Sujeto mediante comando universal
        var idAutoCutout = stringIDToTypeID("autoCutout");
        var desc = new ActionDescriptor();
        executeAction(idAutoCutout, desc, DialogModes.NO);

        // 5. Invertir selección para agarrar el fondo
        doc.selection.invert();

        // 6. Limpiar (borrar) el fondo seleccionado
        doc.selection.clear();

        // 7. Deseleccionar todo
        doc.selection.deselect();

        // 8. Guardar como PNG nativo
        var opcionesPng = new PNGSaveOptions();
        opcionesPng.compression = 5;
        opcionesPng.interlaced = false;
        doc.saveAs(archivoDestino, opcionesPng, true, Extension.LOWERCASE);

        // 9. Cerrar documento
        doc.close(SaveOptions.DONOTSAVECHANGES);

        // 10. LIBERAR MEMORIA VIRTUAL INMEDIATA (Optimización Clave)
        app.purge(PurgeTarget.HISTORY);
        app.purge(PurgeTarget.CLIPBOARD);
        totalProcesados++;

    } catch(error) {
        errores++;
        try {
            app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
            app.purge(PurgeTarget.ALLPURGES);
        } catch(e) {}
    }
}

// Restablecer diálogos
app.displayDialogs = DialogModes.ALL;

// Reporte final
alert("¡PROCESAMIENTO COMPLETADO!\n\nImágenes procesadas: " + totalProcesados + "\nErrores: " + errores + "\n\nArchivos organizados por orientación en la carpeta destino.");
