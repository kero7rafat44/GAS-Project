// الغازات
if (document.getElementById("viewDiv")) {
    if (typeof require === "undefined") {
        console.error("خطأ: لم يتم تحميل ArcGIS JS API. تأكدي من إضافة <script src='https://js.arcgis.com/4.26/'> في gases.html");
    } else {
        require([
            "esri/Map",
            "esri/views/MapView",
            "esri/layers/TileLayer",
            "esri/layers/FeatureLayer",
            "esri/widgets/Legend"
        ], function(Map, MapView, TileLayer, FeatureLayer, Legend) {
            // إنشاء الخريطة بخلفية الأقمار الصناعية
            var map = new Map({
                basemap: "satellite"
            });

            // إضافة طبقة الحدود كـ Feature Layer
            var boundaryLayer = new FeatureLayer({
                url: "https://services1.arcgis.com/DJeqIQwJJ7wxtPdg/arcgis/rest/services/tsp15_WFL1/FeatureServer",
                title: "حدود المنطقة",
                listMode: "hide"
            });
            map.add(boundaryLayer);

            // إعداد عرض الخريطة
            var view = new MapView({
                container: "viewDiv",
                map: map,
                center: [31.3667, 30.262],
                zoom: 13,
                constraints: {
                    minZoom: 5,
                    maxZoom: 30
                }
            });

            // إضافة مفتاح الخريطة
            var legend = new Legend({
                view: view,
                container: "legend"
            });

            // متغير لتتبع آخر طبقة تم تعديلها
            let lastAdjustedLayer = null;

            // دالة لتطبيق التعديلات (إزالة السالب وعكس الترتيب لغاز SO₂)
            function applyLegendAdjustments() {
                var currentLayerTitle = legend.layerInfos[0]?.layer?.title || "";
                var labels = document.querySelectorAll("#legend .esri-legend__layer-cell--info");
                if (!labels.length) {
                    console.log("لم يتم العثور على تسميات في المفتاح لـ", currentLayerTitle);
                    return false;
                }

                // إذا كانت الطبقة هي نفسها التي تم تعديلها سابقًا، لا حاجة لإعادة التعديل ما لم تتغير التسميات
                if (lastAdjustedLayer === currentLayerTitle) {
                    const currentLabels = Array.from(labels).map(label => label.textContent);
                    if (currentLabels.some(label => label.startsWith("-"))) {
                        console.log("تم اكتشاف تسميات مع سالب، سيتم إعادة التعديل لـ", currentLayerTitle);
                    } else if (currentLayerTitle.startsWith("SO₂")) {
                        const layerBody = document.querySelector("#legend .esri-legend__layer-body");
                        if (layerBody) {
                            const rows = Array.from(layerBody.querySelectorAll(".esri-legend__layer-row"));
                            const firstLabel = rows[0]?.querySelector(".esri-legend__layer-cell--info")?.textContent;
                            const lastLabel = rows[rows.length - 1]?.querySelector(".esri-legend__layer-cell--info")?.textContent;
                            const firstValue = parseFloat(firstLabel?.split(" - ")[0]);
                            const lastValue = parseFloat(lastLabel?.split(" - ")[0]);
                            if (firstValue > lastValue) {
                                console.log("الترتيب عاد إلى التنازلي لغاز SO₂، سيتم إعادة العكس");
                            } else {
                                console.log("التعديلات لا تزال مطبقة لـ", currentLayerTitle);
                                return false;
                            }
                        }
                    } else {
                        console.log("التعديلات لا تزال مطبقة لـ", currentLayerTitle);
                        return false;
                    }
                }

                console.log("التسميات قبل التعديل لـ", currentLayerTitle, ":", Array.from(labels).map(label => label.textContent));

                // إيقاف المراقب مؤقتًا لمنع الحلقات اللانهائية
                observer.disconnect();

                // إزالة السالب من التسميات
                labels.forEach(label => {
                    let text = label.textContent.trim();
                    if (text.startsWith("-")) {
                        text = text.replace(/^-(\d+\.\d+)\s*-\s*-(\d+\.\d+)/, "$1 - $2");
                        label.textContent = text;
                    }
                });

                console.log("التسميات بعد إزالة السالب لـ", currentLayerTitle, ":", Array.from(labels).map(label => label.textContent));

                // عكس ترتيب النطاقات فقط إذا كان الغاز هو SO₂
                if (currentLayerTitle.startsWith("SO₂")) {
                    const layerBody = document.querySelector("#legend .esri-legend__layer-body");
                    if (layerBody) {
                        const rows = Array.from(layerBody.querySelectorAll(".esri-legend__layer-row"));
                        console.log("النطاقات قبل العكس (SO₂):", rows.map(row => row.querySelector(".esri-legend__layer-cell--info").textContent));
                        // عكس الصفوف لجعل الترتيب تصاعديًا
                        rows.reverse();
                        layerBody.innerHTML = "";
                        rows.forEach(row => layerBody.appendChild(row));
                        console.log("النطاقات بعد العكس (SO₂):", rows.map(row => row.querySelector(".esri-legend__layer-cell--info").textContent));
                    } else {
                        console.log("لم يتم العثور على .esri-legend__layer-body لعكس النطاقات لغاز SO₂");
                    }
                } else {
                    console.log("الغاز ليس SO₂، لن يتم عكس النطاقات:", currentLayerTitle);
                }

                // تحديث آخر طبقة تم تعديلها
                lastAdjustedLayer = currentLayerTitle;

                // إعادة تشغيل المراقب بعد التعديل
                observer.observe(document.getElementById("legend"), { childList: true, subtree: true });
                return true;
            }

            // مراقبة تغييرات DOM لتطبيق التعديلات عند تحديث المفتاح
            var observer = new MutationObserver(function(mutations) {
                const hasLabels = document.querySelectorAll("#legend .esri-legend__layer-cell--info").length > 0;
                if (hasLabels) {
                    applyLegendAdjustments();
                }
            });

            // استدعاء الدالة عند تحميل المفتاح لأول مرة
            view.when(() => {
                setTimeout(() => {
                    const hasLabels = document.querySelectorAll("#legend .esri-legend__layer-cell--info").length > 0;
                    if (hasLabels) {
                        applyLegendAdjustments();
                    } else {
                        console.log("لم يتم العثور على تسميات في المفتاح عند التحميل الأولي");
                    }
                }, 150); // تأخير 150 ميلي ثانية لضمان استقرار المفتاح
            });

            // تطبيق التعديلات عند تغيير العرض (مثل التكبير/التصغير أو التحريك)
            view.on("extent-change", () => {
                setTimeout(() => {
                    const hasLabels = document.querySelectorAll("#legend .esri-legend__layer-cell--info").length > 0;
                    if (hasLabels) {
                        applyLegendAdjustments();
                    } else {
                        console.log("لم يتم العثور على تسميات في المفتاح بعد تغيير العرض");
                    }
                }, 500); // تأخير صغير لضمان استقرار DOM
            });

            // بدء المراقب
            observer.observe(document.getElementById("legend"), { childList: true, subtree: true });

            // قائمة السنوات من 2015 إلى 2024
            var years = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"];

            // قائمة الطبقات المتاحة لكل غاز وسنة
            var layers = {
                "NO2_2015": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/no2_2015_84_WTL1/MapServer", title: "NO₂ 2015" }),
                "NO2_2016": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/no2_16_84_WTL1/MapServer", title: "NO₂ 2016" }),
                "NO2_2017": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/no2_017_84_WTL1/MapServer", title: "NO₂ 2017" }),
                "NO2_2018": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/no2_2018_WTL1/MapServer", title: "NO₂ 2018" }),
                "NO2_2019": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/no2_2019_WTL1/MapServer", title: "NO₂ 2019" }),
                "NO2_2020": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/no2_2020_WTL1/MapServer", title: "NO₂ 2020" }),
                "NO2_2021": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/no2_2021_84_WTL1/MapServer", title: "NO₂ 2021" }),
                "NO2_2022": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/No2_22_WTL1/MapServer", title: "NO₂ 2022" }),
                "NO2_2023": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/NO2_2023_1984_WTL1/MapServer", title: "NO₂ 2023" }),
                "NO2_2024": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/no2_24_84_WTL1/MapServer", title: "NO₂ 2024" }),

                "CO_2015": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/co_15_WTL1/MapServer", title: "CO 2015" }),
                "CO_2016": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/co_16_WTL1/MapServer", title: "CO 2016" }),
                "CO_2017": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/co_17_WTL1/MapServer", title: "CO 2017" }),
                "CO_2018": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/co_18_WTL1/MapServer", title: "CO 2018" }),
                "CO_2019": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/co_19_WTL1/MapServer", title: "CO 2019" }),
                "CO_2020": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/CO_2020_WTL1/MapServer", title: "CO 2020" }),
                "CO_2021": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/CO_2021_WTL1/MapServer", title: "CO 2021" }),
                "CO_2022": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/co_22_WTL1/MapServer", title: "CO 2022" }),
                "CO_2023": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/CO_23_1984_WTL1/MapServer", title: "CO 2023" }),
                "CO_2024": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/co_24_WTL1/MapServer", title: "CO 2024" }),

                "SO2_2015": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/SO2_2015_84_WTL1/MapServer", title: "SO₂ 2015" }),
                "SO2_2016": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/so216_WTL1/MapServer", title: "SO₂ 2016" }),
                "SO2_2017": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/so2_17_WTL1/MapServer", title: "SO₂ 2017" }),
                "SO2_2018": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/so2_18_WTL1/MapServer", title: "SO₂ 2018" }),
                "SO2_2019": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/so2_19_WTL1/MapServer", title: "SO₂ 2019" }),
                "SO2_2020": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/so2_20_WTL1/MapServer", title: "SO₂ 2020" }),
                "SO2_2021": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/so2_21_84_WTL1/MapServer", title: "SO₂ 2021" }),
                "SO2_2022": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/so2_22_84_WTL1/MapServer", title: "SO₂ 2022" }),
                "SO2_2023": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/so2_23_84_WTL1/MapServer", title: "SO₂ 2023" }),
                "SO2_2024": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/so2_24_84_WTL1/MapServer", title: "SO₂ 2024" }),

                "TSP_2015": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/tsp15_WTL1/MapServer", title: "TSP 2015" }),
                "TSP_2016": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/tsp16_WTL1/MapServer", title: "TSP 2016" }),
                "TSP_2017": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/tsp17_WTL1/MapServer", title: "TSP 2017" }),
                "TSP_2018": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/tsp18_WTL1/MapServer", title: "TSP 2018" }),
                "TSP_2019": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/tsp19_WTL1/MapServer", title: "TSP 2019" }),
                "TSP_2020": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/Tsp_20_WTL1/MapServer", title: "TSP 2020" }),
                "TSP_2021": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/tsp21_WTL1/MapServer", title: "TSP 2021" }),
                "TSP_2022": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/tsp22_WTL1/MapServer", title: "TSP 2022" }),
                "TSP_2023": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/tsp23_WTL1/MapServer", title: "TSP 2023" }),
                "TSP_2024": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/tsp24_WTL1/MapServer", title: "TSP 2024" }),

                "Pm10_2015": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm10_15_WTL1/MapServer", title: "PM10 2015" }),
                "Pm10_2016": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm10_16_WTL1/MapServer", title: "PM10 2016" }),
                "Pm10_2017": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm10_17_WTL1/MapServer", title: "PM10 2017" }),
                "Pm10_2018": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm10_18_WTL1/MapServer", title: "PM10 2018" }),
                "Pm10_2019": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm10_19_WTL1/MapServer", title: "PM10 2019" }),
                "Pm10_2020": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm10_20_WTL1/MapServer", title: "PM10 2020" }),
                "Pm10_2021": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm10_21_WTL1/MapServer", title: "PM10 2021" }),
                "Pm10_2022": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm10_22_WTL1/MapServer", title: "PM10 2022" }),
                "Pm10_2023": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm10_23_WTL1/MapServer", title: "PM10 2023" }),
                "Pm10_2024": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm10_24_WTL1/MapServer", title: "PM10 2024" }),

                "Pm2.5_2015": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm2_5_15_WTL1/MapServer", title: "PM2.5 2015" }),
                "Pm2.5_2016": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/ppm2_5_16_WTL1/MapServer", title: "PM2.5 2016" }),
                "Pm2.5_2017": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pppm2_5_17_WTL1/MapServer", title: "PM2.5 2017" }),
                "Pm2.5_2018": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pppm2_5_18_WTL1/MapServer", title: "PM2.5 2018" }),
                "Pm2.5_2019": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pppm2_5_19_WTL1/MapServer", title: "PM2.5 2019" }),
                "Pm2.5_2020": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/ppm2_5_20_WTL1/MapServer", title: "PM2.5 2020" }),
                "Pm2.5_2021": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/ppm2_5_21_WTL1/MapServer", title: "PM2.5 2021" }),
                "Pm2.5_2022": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm2_5_22_WTL1/MapServer", title: "PM2.5 2022" }),
                "Pm2.5_2023": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm2_5_23_WTL1/MapServer", title: "PM2.5 2023" }),
                "Pm2.5_2024": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm2_5_24_WTL1/MapServer", title: "PM2.5 2024" })
            };

            var currentLayer = null;
            var currentIndex = 0;
            var animationTimer = null;

            // دالة لتحديث الخريطة بناءً على اختيار الغاز والسنة
            function updateMap() {
                lastAdjustedLayer = null; // إعادة تعيين عند تغيير الطبقة
                var gas = document.getElementById("gasSelect").value;
                var yearIndex = parseInt(document.getElementById("yearSlider").value);
                var year = years[yearIndex];
                var layerKey = gas + "_" + year;

                console.log("تحديث الخريطة لـ:", layerKey);

                document.getElementById("yearValue").innerHTML = year;
                document.getElementById("yearSelect").value = yearIndex;

                if (currentLayer) {
                    map.remove(currentLayer);
                    currentLayer = null;
                }

                legend.layerInfos = [];

                if (layers[layerKey]) {
                    currentLayer = layers[layerKey];
                    map.add(currentLayer);
                    legend.layerInfos = [{ layer: currentLayer }];
                    view.zoom = 13;
                    document.getElementById("legend").style.display = "block";

                    currentLayer.when(() => {
                        console.log("الطبقة تم تحميلها:", layerKey);
                        setTimeout(() => {
                            const hasLabels = document.querySelectorAll("#legend .esri-legend__layer-cell--info").length > 0;
                            if (hasLabels) {
                                applyLegendAdjustments();
                            } else {
                                console.log("لم يتم العثور على تسميات في المفتاح بعد تحميل الطبقة:", layerKey);
                            }
                        }, 1500);
                    }).catch(err => {
                        console.error("خطأ في تحميل الطبقة:", layerKey, err);
                    });
                } else {
                    console.log("لا توجد طبقة متاحة لـ:", layerKey);
                    document.getElementById("legend").style.display = "none";
                }
            }

            // دالة لبدء التحريك التلقائي
            function startAnimation() {
                if (animationTimer) {
                    clearInterval(animationTimer);
                }
                animationTimer = setInterval(function() {
                    currentIndex++;
                    if (currentIndex > 9) {
                        clearInterval(animationTimer);
                        animationTimer = null;
                        currentIndex = 0;
                        document.getElementById("yearSlider").value = currentIndex;
                        updateMap();
                        return;
                    }
                    document.getElementById("yearSlider").value = currentIndex;
                    updateMap();
                }, 2000);
            }

            // دالة لإيقاف التحريك
            function pauseAnimation() {
                if (animationTimer) {
                    clearInterval(animationTimer);
                    animationTimer = null;
                }
            }

            // دالة لإيقاف التحريك وإعادة التعيين إلى 2015
            function stopAndReset() {
                if (animationTimer) {
                    clearInterval(animationTimer);
                    animationTimer = null;
                }
                currentIndex = 0;
                document.getElementById("yearSlider").value = currentIndex;
                document.getElementById("yearSelect").value = currentIndex;
                updateMap();
            }

            // ربط الأحداث بالعناصر
            document.getElementById("gasSelect").addEventListener("change", updateMap);
            document.getElementById("yearSlider").addEventListener("input", function() {
                currentIndex = parseInt(this.value);
                updateMap();
            });
            document.getElementById("yearSelect").addEventListener("change", function() {
                currentIndex = parseInt(this.value);
                document.getElementById("yearSlider").value = currentIndex;
                updateMap();
            });
            document.getElementById("startBtn").addEventListener("click", startAnimation);
            document.getElementById("pauseBtn").addEventListener("click", pauseAnimation);
            document.getElementById("stopResetBtn").addEventListener("click", stopAndReset);

            // تحديث الخريطة عند التحميل الأولي
            updateMap();
        });
    }
}